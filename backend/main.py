import os
import shutil
import threading
import time
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from process_video import process_video
from database import SessionLocal, FeedbackDB, ProductDB


# =========================================================
# APP SETUP
# =========================================================

app = FastAPI(title="VIVID Upload API")


UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")

UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# STATIC PROCESSED VIDEOS
# =========================================================

app.mount(
    "/processed",
    StaticFiles(directory="processed"),
    name="processed",
)


# =========================================================
# MODELS
# =========================================================

class Feedback(BaseModel):
    rating: int
    liked: str
    frustrated: str
    feature: str


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: str
    status: str = "Active"
    users: int = 0


class ProductUpdate(BaseModel):
    name: str
    description: str = ""
    price: str
    status: str = "Active"
    users: int = 0


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "status": "ok",
        "message": "VIVID API is running"
    }


# =========================================================
# VIDEO UPLOAD
# =========================================================

@app.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    prompt: str = Form("")
):

    # -----------------------------------------------------
    # 1. VALIDATE FILE TYPE
    # -----------------------------------------------------

    allowed_types = (
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-matroska",
        "video/x-msvideo",
    )

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid file type '{file.content_type}'. "
                "Supported formats: MP4, MOV, MKV, AVI."
            ),
        )


    # -----------------------------------------------------
    # 2. SAVE UPLOAD
    # -----------------------------------------------------

    safe_name = Path(
        file.filename or "uploaded_video.mp4"
    ).name

    dest = UPLOAD_DIR / safe_name


    try:

        with dest.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {exc}"
        )

    finally:

        await file.close()


    # -----------------------------------------------------
    # 3. FILE SIZE
    # -----------------------------------------------------

    file_size_mb = round(
        dest.stat().st_size /
        (1024 * 1024),
        2
    )


    # Current limit
    MAX_FILE_SIZE_MB = 1024


    if file_size_mb > MAX_FILE_SIZE_MB:

        try:
            os.remove(dest)
        except Exception:
            pass

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": (
                    "Video too large. "
                    "Maximum file size is 1024MB."
                )
            }
        )


    print(
        f"[VIVID] Saved upload: "
        f"{dest} ({file_size_mb} MB)"
    )


    # -----------------------------------------------------
    # 4. PROCESS VIDEO
    # -----------------------------------------------------

    print(
        f"[VIVID] Starting processor for: {dest}"
    )


    try:

        processing_result = process_video(
            str(dest),
            prompt
        )

    except Exception as e:

        print(
            f"[UPLOAD ERROR] {e}"
        )

        try:

            if os.path.exists(dest):
                os.remove(dest)

        except Exception:
            pass


        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e)
            }
        )


    # -----------------------------------------------------
    # 5. DELETE ORIGINAL UPLOAD
    # -----------------------------------------------------

    try:

        if os.path.exists(dest):

            os.remove(dest)

            print(
                f"[VIVID AI] Deleted upload → {dest}"
            )

    except Exception as e:

        print(
            f"[VIVID AI] Failed to delete upload → {e}"
        )


    print(
        f"[VIVID] Processor result: "
        f"{processing_result}"
    )


    # -----------------------------------------------------
    # 6. BUILD PROCESSED VIDEO URL
    # -----------------------------------------------------

    processed_video = ""


    if (
        processing_result.get("success")
        and processing_result.get("output_path")
    ):

        output_name = Path(
            processing_result["output_path"]
        ).name


        processed_video = (
            f"/processed/{output_name}"
        )


        print(
            "[VIVID AI] Processed Video URL → "
            f"{processed_video}"
        )


        # Auto-delete after 1 hour
        auto_delete_processed(
            processing_result["output_path"],
            3600
        )


    # -----------------------------------------------------
    # 7. RETURN RESPONSE
    # -----------------------------------------------------

    return JSONResponse(
        status_code=200,
        content={

            "success": True,

            "message":
                processing_result.get(
                    "message",
                    "File processed successfully"
                ),

            "filename":
                safe_name,

            "size_mb":
                file_size_mb,

            "processed_video":
                processed_video,

            "processing":
                processing_result,
        },
    )


# =========================================================
# FEEDBACK
# =========================================================

@app.post("/feedback")
async def save_feedback(data: Feedback):

    db = SessionLocal()

    try:

        feedback = FeedbackDB(
            rating=data.rating,
            liked=data.liked,
            frustrated=data.frustrated,
            feature=data.feature
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        return {
            "success": True,
            "message":
                "Thanks for being a VIVID Beta Tester!"
        }

    finally:

        db.close()


# =========================================================
# GET FEEDBACK
# =========================================================

@app.get("/feedback")
async def get_feedback():

    db = SessionLocal()

    try:

        feedback = (
            db.query(FeedbackDB)
            .order_by(
                FeedbackDB.created_at.desc()
            )
            .all()
        )

        return feedback

    finally:

        db.close()


# =========================================================
# DELETE FEEDBACK
# =========================================================

@app.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: int):

    db = SessionLocal()

    try:

        feedback = (
            db.query(FeedbackDB)
            .filter(
                FeedbackDB.id == feedback_id
            )
            .first()
        )


        if feedback is None:

            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )


        db.delete(feedback)
        db.commit()


        return {
            "success": True,
            "message": "Feedback deleted"
        }

    finally:

        db.close()


# =========================================================
# DASHBOARD STATS
# =========================================================

@app.get("/dashboard/stats")
async def dashboard_stats():

    db = SessionLocal()

    try:

        feedback = (
            db.query(FeedbackDB)
            .all()
        )


        total_feedback = len(
            feedback
        )


        if total_feedback == 0:

            average_rating = 0

        else:

            average_rating = round(
                sum(
                    item.rating
                    for item in feedback
                )
                / total_feedback,
                1
            )


        five_star_reviews = len(
            [
                item
                for item in feedback
                if item.rating == 5
            ]
        )


        return {

            "totalFeedback":
                total_feedback,

            "averageRating":
                average_rating,

            "fiveStarReviews":
                five_star_reviews,

            "betaUsers":
                total_feedback,
        }

    finally:

        db.close()


# =========================================================
# PRODUCTS
# =========================================================

@app.get("/products")
async def get_products():

    db = SessionLocal()

    try:

        products = (
            db.query(ProductDB)
            .order_by(
                ProductDB.id.asc()
            )
            .all()
        )


        # Create the five VIVID plans
        # automatically if the database is empty.

        if not products:

            default_products = [

                ProductDB(
                    name="Free Users",
                    description=
                        "Basic VIVID AI video editing",
                    price="$0",
                    status="Active",
                    users=0,
                ),

                ProductDB(
                    name="Pro Users",
                    description=
                        "Advanced AI editing tools",
                    price="$19",
                    status="Active",
                    users=0,
                ),

                ProductDB(
                    name="Creators",
                    description=
                        "Advanced creator workflow and AI tools",
                    price="$39",
                    status="Active",
                    users=0,
                ),

                ProductDB(
                    name="Agencies",
                    description=
                        "Team collaboration and agency workflows",
                    price="$99",
                    status="Coming Soon",
                    users=0,
                ),

                ProductDB(
                    name="Companies",
                    description=
                        "Enterprise AI video editing and automation",
                    price="Custom",
                    status="Coming Soon",
                    users=0,
                ),
            ]


            db.add_all(
                default_products
            )

            db.commit()


            products = (
                db.query(ProductDB)
                .order_by(
                    ProductDB.id.asc()
                )
                .all()
            )


        return products

    finally:

        db.close()


# =========================================================
# CREATE PRODUCT
# =========================================================

@app.post("/products")
async def create_product(
    data: ProductCreate
):

    db = SessionLocal()

    try:

        product = ProductDB(
            name=data.name,
            description=data.description,
            price=data.price,
            status=data.status,
            users=data.users,
        )


        db.add(product)
        db.commit()
        db.refresh(product)


        return {
            "success": True,
            "message": "Product created",
            "product": product,
        }

    finally:

        db.close()


# =========================================================
# UPDATE PRODUCT
# =========================================================

@app.put("/products/{product_id}")
async def update_product(
    product_id: int,
    data: ProductUpdate
):

    db = SessionLocal()

    try:

        product = (
            db.query(ProductDB)
            .filter(
                ProductDB.id == product_id
            )
            .first()
        )


        if product is None:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )


        product.name = data.name
        product.description = data.description
        product.price = data.price
        product.status = data.status
        product.users = data.users


        db.commit()
        db.refresh(product)


        return {
            "success": True,
            "message": "Product updated",
            "product": product,
        }

    finally:

        db.close()


# =========================================================
# DELETE PRODUCT
# =========================================================

@app.delete("/products/{product_id}")
async def delete_product(
    product_id: int
):

    db = SessionLocal()

    try:

        product = (
            db.query(ProductDB)
            .filter(
                ProductDB.id == product_id
            )
            .first()
        )


        if product is None:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )


        db.delete(product)
        db.commit()


        return {
            "success": True,
            "message": "Product deleted"
        }

    finally:

        db.close()


# =========================================================
# AUTO DELETE PROCESSED VIDEOS
# =========================================================

def auto_delete_processed(
    file_path: str,
    delay_seconds: int = 3600
):

    def delete_file():

        time.sleep(
            delay_seconds
        )


        try:

            if os.path.exists(
                file_path
            ):

                os.remove(
                    file_path
                )


                print(
                    "[VIVID AI] "
                    "Auto-deleted processed → "
                    f"{file_path}"
                )

        except Exception as e:

            print(
                "[VIVID AI] "
                "Auto-delete failed → "
                f"{e}"
            )


    thread = threading.Thread(
        target=delete_file
    )

    thread.daemon = True
    thread.start()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )