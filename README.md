# React Native Auth Task

A small authentication task built with **React Native CLI v0.73.0**.

## Features
* User login with form validation
* Backend error handling (e.g. wrong password, invalid credentials)
* Successful login flow
* Access & refresh token management
* Automatic token refresh every 6 minutes
* Automatic logout after multiple refresh attempts
* Manual logout option
* Global auth state control with Context API
* Persistent session using AsyncStorage

## Tech Stack
* React Native CLI
* TypeScript
* Context API
* Hooks
* AsyncStorage

## Flow
* User logs in
* Validation errors from backend are displayed to the user
* On success, tokens and login time are saved in AsyncStorage
* Access token is refreshed automatically every 6 minutes
* After a limited number of refresh attempts, the user is logged out automatically
* User can also log out manually using the logout button

## Run Project
```bash
npm install
npx react-native run-android
# or
npx react-native run-ios
```

---
