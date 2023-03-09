
const error = (method: any) => {
  const event: any = new Event('error');
  event.data = new Error('Wrong state for ' + method);
  return event;
}


export class AudioRecorder {
  stream: MediaStream;
  state: 'inactive' | 'recording' | 'paused';
  isPaused = false;
  em: DocumentFragment;
  encoder?: Worker;
  context?: AudioContext;
  processor?: ScriptProcessorNode;
  maxOutputSize = 60000;
  clone?: MediaStream | null;
  input?: MediaStreamAudioSourceNode | null;
  slicing?: NodeJS.Timer;
  buffers: Uint8Array[] = [];

  /**
   * @param {MediaStream} stream The audio stream to record.
   */
  constructor(stream: MediaStream) {
    this.stream = stream;
    this.state = 'inactive';
    this.isPaused = false;
    this.em = document.createDocumentFragment();
  }
  pause() {
    this.isPaused = true;
  }
  resume() {
    this.isPaused = false;
  }

  /**
   * Begins recording media.
   * @param {number} [blobTimeLength] The milliseconds to record into each `Blob`.
   */
  start(blobTimeLength: number, maxOutputSize: number) {
    if (this.state !== 'inactive') {
      return this.em.dispatchEvent(error('start'));
    }
    this.state = 'recording';
    this.maxOutputSize = maxOutputSize;

    if (!this.context) {
      this.context = new AudioContext();
    }
    this.clone = this.stream.clone();
    this.input = this.context.createMediaStreamSource(this.clone);

    if (!this.processor) {
      this.processor = this.context.createScriptProcessor(2048, 1, 1);
    }

    this.processor.onaudioprocess = (e) => {
      if (this.state === 'recording') {
        const data = e.inputBuffer.getChannelData(0);
        this.handleAudioInput('encode',data);
      }
    };

    this.input.connect(this.processor);
    this.processor.connect(this.context.destination);

    this.em.dispatchEvent(new Event('start'));

    if (blobTimeLength) {
      this.slicing = setInterval(() => {
        if (this.state === 'recording') this.requestData();
      }, blobTimeLength);
    }

    return true;
  }

  getSampleRate() {
    return this.context?.sampleRate;
  }

  terminateWorker() {
    this.encoder?.terminate();
  }

  /**
   * Stop media capture and raise `dataavailable` event with recorded data.
   *
   * @return {undefined}
   */
  stop() {
    if (this.state === 'inactive') {
      return this.em.dispatchEvent(error('stop'));
    }

    this.requestData();
    this.encoder?.postMessage(['reset']);
    this.state = 'inactive';
    this.clone?.getTracks().forEach((track) => {
      track.stop();
    });
    this.clone = null;
    if (this.context) {
      this.processor?.disconnect(this.context.destination);
    }
    if (this.processor) {
      this.input?.disconnect(this.processor);
      this.input = null;
    }
    return clearInterval(this.slicing);
  }

  /**
   * Raise a `dataavailable` event containing the captured media.
   *
   * @return {undefined}
   *
   * @example
   * this.on('nextData', () => {
   *   recorder.requestData()
   * })
   */
  requestData() {
    if (this.state === 'inactive') {
      return this.em.dispatchEvent(error('requestData'));
    }
    return this.handleAudioInput('dump',null);
  }

  /**
   * Add listener for specified event type.
   *
   * @param {"start"|"stop"|"pause"|"resume"|"dataavailable"|"error"}
   * type Event type.
   * @param {function} listener The listener function.
   */
  addEventListener(event: string, callback: any) {
    this.em.addEventListener(event, callback);
  }

  /**
   * Remove event listener.
   * @param {"start"|"stop"|"pause"|"resume"|"dataavailable"|"error"}
   * type Event type.
   * @param {function} listener The same function used in `addEventListener`.
   *
   */
  removeEventListener(event: string, callback: any) {
    this.em.removeEventListener(event, callback);
  }

  dispatchEvent(data: any) {
    this.em.dispatchEvent(data);
  }

  encode(buffer: Float32Array) {
    let length = buffer.length;
    let array = new Uint8Array(length * 2);
    let view = new DataView(array.buffer);
    for (let i = 0; i < length; i++) {
      let sample = Math.max(
        -32768,
        Math.min(32767, Math.floor(buffer[i] * 32768)),
      );
      let byteOffset = i * 2;
      view.setInt16(byteOffset, sample, true);
    }
    this.buffers.push(array);
  }

  dump(maxOutputSize: number) {
    let outputBuffers = [];
    let buffersPos = 0;
    while (buffersPos < this.buffers.length) {
      let numBuffers = 0;
      let length = 0;

      while (buffersPos + numBuffers < this.buffers.length) {
        let buffer = this.buffers[buffersPos + numBuffers];
        if (numBuffers > 0 && length + buffer.length > maxOutputSize) {
          break;
        }
        ++numBuffers;
        length += buffer.length;
      }

      let array = new Uint8Array(length);
      let offset = 0;

      for (let i = 0; i < numBuffers; ++i) {
        let buffer = this.buffers[buffersPos + i];
        array.set(buffer, offset);
        offset += buffer.length;
      }

      buffersPos += numBuffers;
      outputBuffers.push(array.buffer);
    }
    this.buffers = [];
    return outputBuffers;
  }

  handleAudioInput(command: string, data: Float32Array|null) {
    if (command === 'encode' && data) {
      this.encode(data);
    } else if (command === 'dump') {
      let outputBuffers = this.dump(this.maxOutputSize);
      for (let i = 0; i < outputBuffers.length; ++i) {
        const buf = outputBuffers[i];
        let event: any = new Event('dataavailable');
        event.data = this.isPaused ? new ArrayBuffer(0) : buf;
        this.em.dispatchEvent(event);
      }
    } else if (command === 'reset') {
      this.buffers = [];
    }
  }
}
