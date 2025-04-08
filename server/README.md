# ChurnWatch Server

This is the backend server for the ChurnWatch application, built with Flask and Python. It provides the API endpoints for customer churn prediction and data processing.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Setup

1. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the server directory with the following variables:
```
FLASK_APP=app.py
FLASK_ENV=development
```

## Running the Server

1. Start the development server:
```bash
flask run
```

The server will start on `http://localhost:5000` by default.

## Testing

Run the test suite using pytest:
```bash
pytest
```

For verbose output:
```bash
pytest -v
```

## API Endpoints

- `POST /predict`: Predict customer churn probability
- `POST /retrain`: Retrain the model
- `GET /health`: Health check endpoint

## Project Structure

```
server/
├── app.py              # Main application file
├── train.py            # Training script
├── requirements.txt    # Python dependencies
└── tests/              # Test files
```
<!-- └── .env                # Environment variables (create this) -->

## Dependencies

- Flask: Web framework
- Flask-CORS: Cross-origin resource sharing
- pandas: Data manipulation
- scikit-learn: Machine learning
- python-dotenv: Environment variable management
- pytest: Testing framework

## Contributing

1. Fork the project and create a new branch for your feature
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.