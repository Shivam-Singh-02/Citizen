# Citizen Complaint Portal

## Project Description
This web application allows users to report civic issues such as potholes on roads. It captures the device's location, identifies relevant local authorities (MLA, MP, Municipal Corporation), and drafts a detailed email to these authorities, allowing the user to send it via their device's mail app. It also registers the complaint and displays it on a dashboard for tracking.

## Features
-   **Image Upload & Camera Access:** Users can upload images of civic issues or take a picture directly using their device's camera.
-   **Geolocation:** Automatically captures the device's location (latitude and longitude) when a report is submitted.
-   **Civic Authority Identification:** Based on the captured location, the application identifies:
    -   Local Member of Legislative Assembly (MLA)
    -   Local Member of Parliament (MP)
    -   Responsible Municipal Corporation (e.g., Pune Municipal Corporation)
-   **Authoritative Email Drafting:** Generates a detailed and formal email to the identified authorities, requesting action and information (including contractor details under the Right to Information Act).
-   **Complaint Dashboard:** A dashboard to view all submitted complaints, including their details and uploaded images.

## Technology Stack
-   **Frontend:** React.js (with Bootstrap for styling)
-   **Backend:** Node.js with Express.js
-   **Database:** Simple JSON file (`db.json`) for prototype purposes
-   **Geolocation:** Browser's Geolocation API
-   **Reverse Geocoding:** Nominatim (OpenStreetMap) API
-   **Image Upload:** Multer (Node.js middleware)

## Setup Instructions

### Prerequisites
-   Node.js (LTS version recommended)
-   npm (Node Package Manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Shivam-Singh-02/Citizen.git
    cd Citizen
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```

## How to Run the Application

1.  **Start the Backend Server:**
    ```bash
    cd server
    node index.js &
    cd ..
    ```
    (The `&` runs the server in the background)

2.  **Start the Frontend Development Server:**
    ```bash
    cd client
    npm start
    cd ..
    ```
    This will open the application in your default web browser at `http://localhost:3000`.

## Usage

1.  **Report an Issue:**
    *   On the main page, select an image of the civic issue or take a picture using your device's camera.
    *   Click "Get Location & Submit Report".
    *   Allow browser access to your location.
    *   A success message, detected address, and responsible authorities will be displayed.
2.  **Draft Email:**
    *   After a successful report, click the "Draft Email to Authorities" button.
    *   Your default email client will open with a pre-filled email.
    *   **Important:** Manually attach the image of the issue (found in `server/uploads/`) to the email before sending.
3.  **View Dashboard:**
    *   Click the "View Dashboard" button to see a list of all your submitted complaints.
    *   Click "Back to Report Form" to return to the main page.

## Future Enhancements
-   Implement server-side email sending for direct image attachment.
-   Integrate with a real database (e.g., MongoDB, PostgreSQL).
-   Implement user authentication and authorization.
-   Improve AI-powered civic data retrieval for broader geographical coverage and more precise official identification.
-   Add a map view to the dashboard to visualize reported issues.
