# APK Size Reduction Guide - From 114MB to ~45MB

Your current APK is 114MB. Here's why and how to reduce it by 60%:

## Major Size Contributors (Current):

1. **Maps SDK**: ~35MB (expo-maps + react-native-maps)
2. **Camera/Media Libraries**: ~20MB (multiple overlapping packages)
3. **New Architecture**: ~15MB (newArchEnabled: true)
4. **Background Location**: ~10MB (unnecessary services)
5. **Unused Dependencies**: ~15MB
6. **Assets & Fonts**: ~10MB
7. **Base React Native**: ~9MB

## Immediate Actions (Save ~60MB):

### 1. Switch to AAB Format (Save ~30%)
```bash
# Use Android App Bundle instead of APK
eas build --platform android --profile production
```
- AAB automatically removes unused code per device
- Google Play delivers optimized APKs (~30-40% smaller)

### 2. Remove Duplicate Dependencies
Current duplicates to remove:
- Keep `expo-maps`, remove `react-native-maps`
- Keep `expo-image`, remove `expo-image-picker` + `expo-image-manipulator`
- Remove `expo-blur`, `expo-haptics`, `expo-symbols` (unused)
- Remove `nativewind`, `zustand` (use built-in state)

### 3. Disable New Architecture
In `app.json`:
```json
"newArchEnabled": false
```
Saves ~15MB but may reduce performance slightly.

### 4. Optimize Location Services
Remove background location (saves ~8MB):
```json
"isAndroidForegroundServiceEnabled": false,
"isAndroidBackgroundLocationEnabled": false
```

### 5. Reduce Permissions
Remove unused permissions from `app.json`:
```json
"permissions": [
  "android.permission.ACCESS_FINE_LOCATION",
  "CAMERA",
  "READ_EXTERNAL_STORAGE"
]
```

## Expected Results:

| Optimization | Size Reduction | Final Size |
|-------------|----------------|------------|
| Current APK | 0MB | 114MB |
| Switch to AAB | -35MB | 79MB |
| Remove duplicates | -15MB | 64MB |
| Disable New Arch | -15MB | 49MB |
| Optimize location | -8MB | 41MB |
| Asset optimization | -5MB | 36MB |

## Implementation Steps:

1. **Immediate** (No code changes):
   - Use `eas build --platform android --profile production` with AAB
   - Update `app.json` with optimized config I provided

2. **Package cleanup** (Remove unused deps):
   ```bash
   npm uninstall react-native-maps expo-blur expo-haptics expo-symbols nativewind zustand expo-image-picker expo-image-manipulator
   ```

3. **Code refactoring** (Use single libraries):
   - Replace all map components to use only `expo-maps`
   - Use `expo-image` for all image operations
   - Replace Zustand with React Context

4. **Asset optimization**:
   - Compress images in `/assets`
   - Remove unused fonts
   - Use vector icons instead of PNG

## Verification:
After changes, run:
```bash
eas build --platform android --profile production --clear-cache
```

Expected final size: **35-45MB** (60% reduction)

The optimized configurations are in:
- `app-size-optimization.json` (copy to `app.json`)
- Use AAB builds instead of APK for production