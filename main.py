from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
from PIL import Image
from fastai.vision.all import *

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

class GuessRequest(BaseModel):
    data: list[int]

class GuessResponse(BaseModel):
    prediction: int

@app.get("/", response_class=FileResponse)
async def read_root():
        return FileResponse("static/index.html")

# Initialize the model (this would be done once at startup)
def load_model():
    try:
        # Create a dummy dataloaders for the learner
        # This is needed because fastai requires dls for vision_learner
        path = untar_data(URLs.MNIST)
        dls = ImageDataLoaders.from_folder(path, train='training', valid='testing')
        print(path)
        # Create the learner and load the pretrained model
        learn = vision_learner(dls, resnet34, metrics=error_rate)
        learn.path = Path(".")
        learn.model_dir = "."
        learn.load("resnet34-finetuned")

        return learn
    except FileNotFoundError:
        print("Warning: Model file not found. Using random predictions for demo.")
        return None

# Load the model at startup
model = load_model()

@app.post("/guess", response_model=GuessResponse)
async def guess_number(request: GuessRequest):
    try:
        # Convert the array to numpy array and reshape
        arr = np.array(request.data).reshape((28, 28)).astype('uint8') * 255
        im = Image.fromarray(arr)

        # Save the image temporarily
        path = f"temp.png"
        im.save(path)

        # Use the model to predict if available, otherwise use random prediction
        if model is not None:
            pred, _, _ = model.predict(path)
            prediction = int(pred)
        else:
            # Fallback to random prediction for demo purposes
            import random
            prediction = random.randint(0, 9)

        return GuessResponse(prediction=prediction)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)