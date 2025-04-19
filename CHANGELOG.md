# Changelog

## Version 0.2.0 (2025-04-18)

### Added
- **Recordings Feature**
  - Implemented recordings list screen to display saved recordings
  - Added recording detail screen with transcript display
  - Integrated LLM processing using Groq API
  - Added template selection for processing recordings

- **API Security**
  - Implemented secure API key storage in app.json
  - Added platform-specific configuration for iOS and Android

### Improved
- **Speech Recognition**
  - Separated recording state from recognition state for better reliability
  - Added auto-restart functionality for continuous recording
  - Improved transcript persistence during temporary disconnections
  - Reduced recognition restart delay to 500ms for better user experience

- **User Experience**
  - Replaced alert dialogs with toast notifications for recording confirmation
  - Added auto-navigation to recording details after saving
  - Improved LLM prompt formatting with clear response structure
  - Enhanced error handling throughout the application

## Version 0.1.0 (2025-04-18)

### Added
- **Speech Recognition Feature**
  - Implemented audio recording and speech-to-text functionality
  - Added real-time transcript display
  - Created custom hook `useSpeechToText` for speech recognition logic

- **AI Templates System**
  - Added templates list screen with default "Meeting Notes" template
  - Implemented template detail view showing sections and descriptions
  - Created template creation/editing functionality
  - Added persistent storage using AsyncStorage

- **Navigation**
  - Implemented screen navigation using React Navigation
  - Added transitions between screens

- **UI Components**
  - Created reusable Header component with navigation icons
  - Implemented custom RecordButton component
  - Added TranscriptBox component for displaying transcribed text

### Improved
- **Project Structure**
  - Reorganized files following proper architecture principles
  - Moved screens to dedicated `/screens` directory
  - Separated reusable components into `/components` directory
  - Created dedicated directories for hooks, types, utils, and navigation

- **Type Safety**
  - Added TypeScript type definitions for all components
  - Created centralized navigation types
  - Improved type safety throughout the application

- **Theming**
  - Implemented centralized color system in `theme/colors.ts`
  - Applied consistent styling across all components
  - Created modern dark theme UI

### Fixed
- Resolved UUID crypto.getRandomValues() error by implementing custom ID generator
- Fixed navigation type errors
- Addressed component organization issues
- Improved error handling in speech recognition

### Technical Debt Addressed
- Removed inline styles in favor of StyleSheet
- Centralized navigation type definitions
- Improved component reusability
- Enhanced code organization and readability

## Future Improvements
- Add unit and integration tests
- Implement user authentication
- Add cloud synchronization for templates
- Create light/dark theme toggle
- Improve accessibility features
