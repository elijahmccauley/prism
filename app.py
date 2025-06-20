from flask import Flask, request, jsonify
from flask_cors import CORS

import findspark
findspark.init()

from pyspark.sql import SparkSession
from pyspark.ml.regression import GBTRegressionModel
from pyspark.ml.feature import VectorAssembler
from pyspark.sql.types import StructType, StructField, StringType, FloatType

spark = None
model = None
MODEL_PATH = "./gbt_model"

def initialize_spark_load_model():
    print("Initializing Spark Session...")
    global spark, model
    spark = SparkSession.builder \
        .appName("PredictionAPI") \
        .master("local[*]") \
        .getOrCreate()
    print("Spark Session Initialized.")
    spark.sparkContext.setLogLevel("ERROR")
    print(f"Loading GBT Model from {MODEL_PATH}...")
    model = GBTRegressionModel.load(MODEL_PATH)
    print("Model loaded successfully.")
    
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST']) 

def predict():
    if not spark or not model:
        return jsonify({"error, spark or model not initialized"}), 500
    data = request.json
    
    print("Received data:", data)
    
    flat_data = {}
    
    for year, events in data.items():
        for event, time in events.items():
            flat_data[f"{year}_{event}"] = time
            
    try:
        # - Convert times to seconds
        # - Handle null/empty strings (impute them)
        # - Create indicator columns for missing values
        features_for_model = preprocess_data_for_prediction(flat_data)
        
        schema = StructType([StructField(name, FloatType(), True) for name in features_for_model.keys()])
        new_data_df = spark.createDataFrame([list(features_for_model.values())], schema)
        
        feature_columns = list(features_for_model.keys())
        assembler = VectorAssembler(inputCols=feature_columns, outputCol="features")
        data_to_predict = assembler.transform(new_data_df)
        
        prediction_result = model.transform(data_to_predict)
        predicted_time = prediction_result.select('prediction').first()[0]
        
        print(f"Predicted time (seconds): {predicted_time}")
        
        return jsonify({'predicted_5k_time_seconds': predicted_time})
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to process prediction request."}), 500
    
    
# ['FR_5k', 'SO_5k', 'JR_5k', 'SR_5k', 'FR_3200', 'SO_3200', 'JR_3200', 'SR_3200', 'FR_1600', 'SO_1600', 'JR_1600', 'SR_1600', 'FR_800', 'SO_800', 'JR_800', 'SR_800']
def preprocess_data_for_prediction(flat_data):
    for key in flat_data.keys():
        if flat_data[key] is None:
            flat_data[key] = 9999999
        else:
            t = flat_data[key]
            minutes, seconds = t.split(":")
            total_seconds = int(minutes) * 60 + float(seconds)
            flat_data[key] = total_seconds
    return flat_data


if __name__ == '__main__':
    # Initialize Spark and the model when the script starts
    initialize_spark_load_model()
    # Run the Flask app
    app.run(debug=True, port=5001)
