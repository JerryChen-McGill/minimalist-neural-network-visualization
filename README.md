# Neural Network Visualization: "1" vs "一" Recognition

An interactive web application that demonstrates how a neural network classifies between the digit "1" and the Chinese character "一" based on drawn patterns.

## Features

- **Interactive Drawing Grid**: Click or drag to draw patterns
- **Real-time Neural Network Visualization**: See how data flows through the network
- **Dynamic Connection Activation**: Watch connections light up as data propagates
- **Pattern Recognition**: The network detects horizontal vs vertical line patterns
- **Responsive Design**: Works on both desktop and mobile devices

## How It Works

1. **Input Layer**: 4 squares where you draw your pattern
2. **Hidden Layer**: 4 nodes that detect specific line patterns
3. **Output Layer**: 2 nodes that classify the input as "1" or "一"
4. **Pattern Recognition**: The network uses weights to identify horizontal vs vertical line orientations

## Usage

1. Click or drag to draw a pattern in the left grid
2. Click "Calculate" to process the hidden layer
3. Click "Calculate" again to get the final prediction
4. The result will show whether your pattern is classified as "1" or "一"

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Neural Network**: Custom implementation with configurable weights
- **Activation Functions**: Threshold-based activation for hidden and output layers
- **Visualization**: Dynamic CSS animations and state management

## Live Demo
https://jerrychen-mcgill.github.io/minimalist-neural-network-visualization/

## License
MIT License - feel free to use and modify!

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.