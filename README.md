Smart Parking BD - MERN Stack

Smart Parking BD is a smart parking management web application built with the MERN stack.

The original project was made with HTML, CSS, and JavaScript. This version was rebuilt using MongoDB, Express.js, React, and Node.js.

The system allows users to create an account, find parking slots, book a slot, make a demo payment, and get a QR ticket. It also has an admin panel for managing the parking system.

Features

• User registration and login
• Secure user authentication
• Parking slot booking
• Live parking slot updates
• Admin dashboard
• Automatic booking expiration
• QR ticket generation
• CSV data export
• MongoDB database
• Socket.io for live updates
• Face verification demo
• bKash, Nagad, Rocket, and Upay payment demos
• Card payment demo

Project Structure

smart-parking-mern/

```
client/       React frontend

server/       Node.js and Express backend

.gitignore
```

Technologies Used

Frontend

• React
• Vite
• React Router
• Axios
• Socket.io Client
• qrcode.react

Backend

• Node.js
• Express.js
• Mongoose
• Socket.io
• JWT
• bcryptjs

Database

• MongoDB
• MongoDB Atlas

Important Notes

Some parts of the project are demos and are not connected to real services yet.

Face Verification

The face verification feature uses the camera and shows simple steps such as:

• Look straight
• Smile
• Turn your head

This is only a demo. It does not actually check whether the person is real using AI.

For a real system, an actual face liveness system would need to be added.

Payment

The following payment methods are available as demos:

• bKash
• Nagad
• Rocket
• Upay

The app shows a demo payment process, but it does not make a real payment.

For a real payment system, the official payment APIs would need to be connected.

Card Payment

The card payment page is also a demo.

Card information is only entered into the website. It is not sent to a real payment service such as Stripe or SSLCommerz.

How to Run the Project

1. Install Node.js

Install Node.js version 18 or newer.

Check that Node.js is installed:

node -v

npm -v

2. Set Up MongoDB

Create a free MongoDB Atlas account and create a database.

You will need:

• MongoDB username
• MongoDB password
• MongoDB connection string

Your connection string will look something like:

mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/

3. Open the Project

Open the project folder in VS Code:

smart-parking-mern

You will need two terminals.

One terminal will run the backend and the other will run the frontend.

4. Set Up the Backend

Open the first terminal:

cd server

npm install

Create a file named .env inside the server folder.

Add:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=[http://localhost:5173](http://localhost:5173)

ADMIN_USERNAME=admin

ADMIN_PASSWORD=admin123

Example:

PORT=5000

MONGO_URI=mongodb+srv://myuser:mypass123@cluster0.abcde.mongodb.net/smartParkingBD

JWT_SECRET=my-secret-key

CLIENT_URL=[http://localhost:5173](http://localhost:5173)

ADMIN_USERNAME=admin

ADMIN_PASSWORD=admin123

Then start the backend:

npm run dev

The backend should start on:

[http://localhost:5000](http://localhost:5000)

The first time the server starts, the system will create the initial 12 parking slots automatically.

5. Set Up the Frontend

Open the second terminal.

From the main project folder:

cd client

npm install

Create a file named .env inside the client folder.

Add:

VITE_API_URL=[http://localhost:5000/api](http://localhost:5000/api)

VITE_SOCKET_URL=[http://localhost:5000](http://localhost:5000)

Then start the frontend:

npm run dev

You should see a local address such as:

[http://localhost:5173/](http://localhost:5173/)

Open that address in your browser.

6. Test the Website

Once both the backend and frontend are running:

1. Create a new account.
2. Log in.
3. Go to the booking page.
4. Select an available parking slot.
5. Complete the face verification demo.
6. Select a payment method.
7. Confirm the booking.
8. Check your QR ticket.

Live Parking Updates

The project uses Socket.io to update parking slot information in real time.

For example, if one user books a parking slot, other users who have the website open can see the slot status change without refreshing the page.

You can test this by opening the website in two browser tabs.

Admin Panel

The project also has an admin panel.

Use the admin username and password from the server .env file.

For example:

Username: admin

Password: admin123

You can change these values in the .env file.

How the Project Works

The frontend communicates with the backend through API requests.

React

↓

API Requests

↓

Express / Node.js

↓

MongoDB

For live parking updates, Socket.io is used.

User 1 ──┐

User 2 ──┼── Socket.io ── Server

User 3 ──┘

This allows parking slot changes to be shared with connected users in real time.

Environment Files

The project uses .env files for private settings.

Server .env

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=[http://localhost:5173](http://localhost:5173)

ADMIN_USERNAME=admin

ADMIN_PASSWORD=admin123

Client .env

VITE_API_URL=[http://localhost:5000/api](http://localhost:5000/api)

VITE_SOCKET_URL=[http://localhost:5000](http://localhost:5000)

Do not upload .env files to GitHub.

They may contain your database password, admin password, and other private information.

Common Problems

Port 5000 is already being used

You can stop the old process or run:

npx kill-port 5000

Then start the server again:

npm run dev

MongoDB is not connecting

Check:

• MongoDB username
• MongoDB password
• MongoDB connection string
• MongoDB Atlas Network Access settings

Frontend shows "Network Error"

Make sure the backend is running.

Also check that the VITE_API_URL value is correct.

Camera is not working

Allow camera permission when the browser asks for it.

npm install gives an error

Check your Node.js version:

node -v

Use Node.js version 18 or newer.

Running the Project

You need to run both parts of the project.

Backend

cd server

npm run dev

Frontend

cd client

npm run dev

Then open:

[http://localhost:5173/](http://localhost:5173/)

Keep both terminals running while using the website.

Future Improvements

Some features that can be added later:

• Real face liveness detection
• Real bKash payment
• Real Nagad payment
• Real card payment
• SSLCommerz integration
• Stripe integration
• Email notifications
• SMS notifications
• Better admin controls
• More parking locations
• Better parking reports
• Online payment verification

License

This project was created for educational and demonstration purposes.
