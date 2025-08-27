from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory "database"
all_feedback = []

@app.route('/api/feedback', methods=['GET', 'POST'])
def handle_feedback():
    if request.method == 'POST':
        new_feedback = request.get_json()
        all_feedback.append(new_feedback)
        print(f"Received new feedback for date: {new_feedback.get('visit_details', {}).get('visit_date')}")
        return jsonify({"message": "Feedback received successfully!"}), 201

    if request.method == 'GET':
        print(f"Sending {len(all_feedback)} feedback entries to the manager.")
        return jsonify(all_feedback[::-1])

if __name__ == '__main__':
    app.run(debug=True, port=5000)