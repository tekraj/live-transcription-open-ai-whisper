import whisper
import torch
class TranscribeAudio:
    def __init__(self):
        # use CUDA if available
        DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
        # load small.en model
        # for more information visit https://github.com/openai/whisper
        self.model = whisper.load_model("small.en",DEVICE)
        self.device = DEVICE

    def transcribe(self,file):
        try:
            load_audio_file = whisper.load_audio(file)
            trimmed_audio = whisper.pad_or_trim(load_audio_file)
            result = self.model.transcribe(trimmed_audio,language='en',fp16=False)
            return result
        except Exception as e:
            print(e)
            return 'error'
