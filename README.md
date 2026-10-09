# Fake News Detection

A machine learning-based web application that detects whether a given news article is likely to be Fake News or Real News.

## Project Overview

Fake news can spread quickly through social media and online platforms. This project uses Natural Language Processing (NLP) and Machine Learning to analyze the text of a news article and classify it as either Fake News or Real News.

## Technologies Used

- Python
- Flask
- Pandas
- Scikit-learn
- Natural Language Processing (NLP)
- TF-IDF Vectorization
- Machine Learning
- HTML
- CSS
- Joblib

## Features

- Enter or paste a news article.
- Clean and preprocess the text.
- Convert text into numerical features using TF-IDF.
- Predict whether the news is Fake or Real.
- Display prediction confidence.
- Simple and user-friendly web interface.

## Machine Learning Model

The project uses:

- TF-IDF Vectorizer for converting text into numerical features.
- Machine Learning classification model for detecting Fake and Real News.

The model was trained using a dataset containing Fake and Real news articles.

## Dataset

The dataset contains:

- Fake News articles
- Real News articles

The data is divided into training and testing datasets before training the model.

## Model Performance

The current trained model achieved approximately:

**98.93% accuracy**

on the test dataset.

## Project Structure

```text
FakeNewsDetection/
│
├── dataset/
│   ├── Fake.csv
│   └── True.csv
│
├── model/
│   ├── fake_news_model.pkl
│   └── tfidf_vectorizer.pkl
│
├── templates/
│   └── index.html
│
├── app.py
├── predict.py
├── train_model.py
├── requirements.txt
└── README.md