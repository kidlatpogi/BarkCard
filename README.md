# BarkCard App

A React Native mobile application for student card management built with Expo and Firebase.

## Features

- 🔐 **Authentication**: Email/password login with Firebase Auth
- 👤 **User Management**: Student account management
- 🏫 **Domain Validation**: Restricted to @student-nudasma.online email domains
- 📱 **Cross Platform**: Works on both iOS and Android
- 🔥 **Firebase Integration**: Real-time database with Firestore

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Navigation**: React Navigation v7
- **Styling**: React Native StyleSheet API
- **State Management**: React Hooks (useState)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BarkCard-App.git
cd BarkCard-App
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `assets/src/firebaseConfig.js` with your Firebase credentials

4. Start the development server:
```bash
npx expo start
```

5. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Project Structure

```
BarkCard/
├── App.js                 # Main app component with routing
├── index.js              # Entry point
├── package.json          # Dependencies and scripts
├── assets/
│   ├── Fonts/            # Custom fonts
│   └── src/
│       ├── firebaseConfig.js    # Firebase configuration
│       ├── COMPONENTS/          # Reusable components
│       ├── IMAGES/             # App images and icons
│       ├── SCREENS/            # Screen components
│       │   ├── Login.js        # Login screen
│       │   └── HomeScreen.js   # Main dashboard
│       └── STYLES/             # StyleSheet files
│           └── Login.styles.js # Login screen styles
```

## Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Firebase Configuration

The app uses Firebase for:
- **Authentication**: Email/password sign-in
- **Database**: Firestore collection `tbl_User`
- **Security**: Domain-restricted registration

Make sure to configure your Firebase project and update the credentials in `firebaseConfig.js`.

## Dependencies

### Select Philippines Address
https://github.com/isaacdarcilla/select-philippines-address.git

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Contact

For questions and support, please contact the development team.