# Hybrid System 2D Simulator - Architecture Guide

## Overview

This is an interactive 2D simulation environment built with React for educational purposes. It demonstrates a hybrid vehicle's electrical system with real-time signal monitoring and interactive tools.

## Core Architecture

### 1. **Simulation Engine** (`useSimulation` hook)

The central simulation state manager that controls:
- **Global Time (t)**: Continuous time value for animation
- **System State**:
  - `engineRpm`: Engine rotation speed (0-3000 RPM)
  - `motorRpm`: Motor rotation speed (0-2000 RPM)  
  - `batterySoc`: Battery state of charge (0-100%)
  - `throttle`: User control input (0-1)
  - `waveformData`: Buffered signal data for oscilloscope (last 512 points)
  - `testPointValue`: Current measured voltage at connected test point

**Update Loop**: Uses `requestAnimationFrame` for 60fps rendering with physics simulation.

### 2. **Signal Source System** (`SignalSource` class)

Generates realistic voltage signals for each component:

```javascript
class SignalSource {
  getSignal(t, throttle) {
    // Returns: baseVoltage * throttle + sine_wave + noise
    // Creates realistic AC/DC hybrid signals
  }
}
```

Components:
- **Battery**: 144V DC with ripple based on throttle
- **Motor**: 120V AC sine wave at 2Hz frequency
- **Engine**: 12V spike pattern simulating alternator output

### 3. **Canvas Oscilloscope**

Professional-grade waveform display:
- **Grid System**: Major and minor grids for precise measurements
- **Autoscaling**: 
  - `voltsPerDiv`: 5, 10, 20, 50, 100V per division
  - `timebase`: 0.1, 0.5, 1, 2, 5 ms per division
- **Features**:
  - Real-time data rendering
  - Axis labels and grid
  - Sample counter
  - 60fps smooth animation
  - Green phosphor CRT aesthetic

### 4. **SVG Circuit Schematic**

Interactive 2D electrical schematic with:
- **Components**:
  - Battery (144V): Blue box on left
  - Motor: Green circle in center
  - ICE (Engine): Orange box on right
- **Test Points**: Circular connectors on each component
- **Energy Flow Visualization**: Yellow particles flowing between components when throttle > 30%
- **Interactive Features**:
  - Highlight on hover
  - Glow effect when connected
  - Dynamic metrics display

### 5. **Draggable Probe System**

Intuitive probe connection mechanism:
- Drag probe to test points
- Snap detection (20px proximity threshold)
- Visual feedback:
  - Gray: disconnected
  - Yellow: near test point
  - Red: connected
- Real-time value reading from connected point

### 6. **Control Panel**

Main simulator controls:
- **Throttle Slider**: 0-100% control (affects all signals)
- **Start/Stop Button**: Toggles simulation loop
- **Real-time Metrics**: RPM, SOC, Time display

### 7. **Multimeter Display**

Digital multimeter component:
- **Display**: Large green LCD-style readout
- **Modes**: AC/DC, Range selection (UI ready)
- **Connection Status**: Visual indicator
- **Realistic Layout**: Buttons and screen mimicking real DMM

## File Structure

```
index.html
├── Inline React Components
│   ├── useSimulation (hook)
│   ├── SignalSource (class)
│   ├── CanvasOscilloscope
│   ├── CircuitSchematic
│   ├── DraggableProbe
│   ├── MultimeterDisplay
│   ├── ControlPanel
│   └── EnhancedSimulatorPage
└── Styling (inline CSS + dark theme)
```

## Color Scheme (Engineering Style)

| Element | Color | Hex |
|---------|-------|-----|
| Primary Background | Very Dark Blue | `#0f172a` |
| Panel Background | Dark Slate | `#1e293b` |
| Grid | Teal | `#2d5f6f` |
| Primary Text | Light Gray | `#e2e8f0` |
| Accent (Active) | Cyan | `#0ea5e9` |
| Signal (Waveform) | Green | `#10ff00` |
| Energy Flow | Amber | `#fbbf24` |
| Error/Connected | Red | `#ef4444` |
| Component (Motor) | Green | `#10b981` |
| Component (Engine) | Amber | `#f59e0b` |
| Component (Battery) | Cyan | `#0ea5e9` |

## Usage Flow

1. **Start Simulation**: Click START button in Control Panel
2. **Select Test Point**: 
   - Drag probe to component on schematic
   - Visual feedback shows proximity
3. **Choose Tool**:
   - Oscilloscope: View real-time waveform
   - Multimeter: View DC voltage value
4. **Analyze Signals**:
   - Adjust throttle to see changes
   - Use oscilloscope timebase/volt-div controls
   - Observe energy particles flowing

## Physics & Signal Equations

### Engine RPM
```
RPM = max(0, sin(t) * 3000 + 2000)
```

### Motor RPM
```
RPM = max(0, cos(t) * 2000 + 1500)
```

### Battery SOC (State of Charge)
```
If throttle > 0.6: SOC -= 0.01 per frame (discharging)
If throttle < 0.3: SOC += 0.005 per frame (charging)
Clamped to [0, 100]
```

### Signal Values
```
Battery: 144 * throttle + noise
Motor: 120 * sin(t * 2π) + noise
Engine: 12 + sin(t * 3π) * 5
```

## Extension Points

### Adding New Components
1. Add test point to `testPoints` object
2. Extend `CircuitSchematic` SVG
3. Add signal generation in `useSimulation` hook

### Custom Signal Patterns
```javascript
// In useSimulation hook
const customSignal = new SignalSource("custom", 48, 0.5);
const value = customSignal.getSignal(t, throttle);
```

### New Measurement Tools
Create new component consuming:
- `simulationState.connectedTestPoint`
- `simulationState.testPointValue`
- `simulationState.waveformData`

## Performance Considerations

- **Canvas Rendering**: Uses `devicePixelRatio` for sharp displays
- **RAF Loop**: Optimized for 60fps at 120dp
- **State Updates**: Batched in React
- **Memory**: Waveform buffer capped at 512 samples

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Requires ES6 and Canvas support

## Learning Outcomes

Students can understand:
1. **Electrical Signals**: AC/DC, noise, phase relationships
2. **Measurement Techniques**: Using oscilloscope and multimeter
3. **System Integration**: How battery, motor, and engine interconnect
4. **Energy Flow**: Visualization of power distribution
5. **Real-world Electronics**: Professional tool interfaces

## Future Enhancements

- [ ] FFT spectrum analyzer
- [ ] Cursor measurements on oscilloscope
- [ ] Export waveform data (CSV)
- [ ] Multiple simultaneous probes
- [ ] Simulation scenario presets
- [ ] Physics-based battery model
- [ ] PWM signal simulation
- [ ] 3D visualization export

## License

Educational use - Hybrid Lab LMS Platform

---

Created: 2026 | Version: 2.0 (2D Interactive Edition)
