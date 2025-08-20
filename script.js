// Neural Network Weights - Line pattern detection
// Hidden layer detects horizontal vs vertical line patterns
const weights = {
    // Input to Hidden weights [4 inputs × 4 hidden nodes]
    // 输入顺序: [左上0, 右上1, 左下2, 右下3]
    inputToHidden: [
        [1, 0, 1, 0],  // 左上0: 权重为 [1,0,1,0]
        [0, 1, 1, 0],  // 右上1: 权重为 [0,1,1,0]
        [1, 0, 0, 1],  // 左下2: 权重为 [1,0,0,1]
        [0, 1, 0, 1]   // 右下3: 权重为 [0,1,0,1]
    ],
    // Hidden to Output connections (no weights, only connections)
    // 连接关系: 1-2, 2-2, 3-1, 4-1 (hidden节点索引从0开始，所以是0-1, 1-1, 2-0, 3-0)
    hiddenToOutputConnections: [
        [false, true],  // Hidden 0: 只连接到 Output 1
        [false, true],  // Hidden 1: 只连接到 Output 1  
        [true, false],  // Hidden 2: 只连接到 Output 0
        [true, false]   // Hidden 3: 只连接到 Output 0
    ]
};

// Biases (adjusted for threshold-based activation)
const biases = {
    hidden: [0, 0, 0, 0],
    output: [0, 0]  // 移除偏置，让权重决定结果
};

let currentInput = [0, 0, 0, 0];
let buttonState = 'ready'; // 'ready', 'calculate', 'clear'
let hiddenProcessed = false;
let outputProcessed = false;
let hiddenOutputs = [];
let outputOutputs = [];
let isDrawing = false; // 跟踪鼠标是否正在拖动绘制

// Sigmoid activation function
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

// Initialize the grid
function initGrid() {
    const cells = document.querySelectorAll('.grid-cell');
    const grid = document.getElementById('grid');

    // 保留原有的点击功能
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => toggleCell(index));
        
        // 添加鼠标移动事件
        cell.addEventListener('mouseover', (e) => {
            if (isDrawing) {
                const index = parseInt(cell.getAttribute('data-index'));
                if (currentInput[index] === 0) { // 只在方块未被填充时填充
                    toggleCell(index);
                }
            }
        });
    });
    
    // 添加鼠标按下事件（开始绘制）
    grid.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 只响应左键
            isDrawing = true;
        }
    });
    
    // 添加鼠标松开事件（停止绘制）
    window.addEventListener('mouseup', (e) => {
        if (e.button === 0) { // 只响应左键
            isDrawing = false;
        }
    });
    
    // 防止拖动时选中文本
    grid.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
    
    // Draw initial connections
    drawConnections();
}

function toggleCell(index) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    currentInput[index] = currentInput[index] === 0 ? 1 : 0;
    
    if (currentInput[index] === 1) {
        cell.classList.add('filled');
    } else {
        cell.classList.remove('filled');
    }
    
    updateInputNodes();
}

function updateInputNodes() {
    // Update input nodes with new values
    currentInput.forEach((value, i) => {
        const nodeValue = document.querySelector(`#input-${i} .node-value`);
        if (nodeValue) {
            nodeValue.textContent = value;
        }
        
        const node = document.getElementById(`input-${i}`);
        if (node) {
            // 清除所有状态类
            node.classList.remove('activated', 'light-activated');
            // 如果值为1，添加激活状态
            if (value === 1) {
                node.classList.add('activated');
            }
        }
    });
    
    // Reset hidden and output layers
    hiddenProcessed = false;
    outputProcessed = false;
    resetHiddenAndOutput();
    
    // 如果用户改变了图案且之前是completed状态，重新激活按钮
    if (buttonState === 'completed') {
        buttonState = 'ready';
    }
    
    // Update button state
    updateButtonState();
    
    // Update connection states when input changes
    updateConnectionStates();
}

function resetHiddenAndOutput() {
    // Reset hidden nodes
    for (let i = 0; i < 4; i++) {
        const node = document.getElementById(`hidden-${i}`);
        const valueDiv = document.getElementById(`hidden-value-${i}`);
        if (node && valueDiv) {
            node.classList.remove('activated', 'light-activated');
            valueDiv.textContent = '0.0';
        }
    }
    
    // Reset output nodes
    for (let i = 0; i < 2; i++) {
        const node = document.getElementById(`output-${i}`);
        const valueDiv = document.getElementById(`output-value-${i}`);
        if (node && valueDiv) {
            node.classList.remove('activated', 'light-activated');
            valueDiv.textContent = '0.0';
        }
    }
    

}

function processHiddenLayer() {
    if (!hiddenProcessed) {
        // First click: Calculate hidden layer
        hiddenOutputs = [];
        
        // 计算每个hidden node的值：Sum(i=0 to 3)(Input Node[i] × Weight[i][j])
        for (let h = 0; h < 4; h++) {
            let sum = 0; // 不使用bias，直接从0开始
            
            // 对每个input node，计算 input value × weight
            for (let i = 0; i < 4; i++) {
                const inputValue = currentInput[i];
                const weight = weights.inputToHidden[i][h];
                const contribution = inputValue * weight;
                sum += contribution;
            }
            
            // 直接使用计算出的sum作为该hidden node的值
            hiddenOutputs.push(sum);
            
            // Update node display
            const node = document.getElementById(`hidden-${h}`);
            const valueDiv = document.getElementById(`hidden-value-${h}`);
            if (node && valueDiv) {
                valueDiv.textContent = sum.toFixed(1);
                
                // 清除所有状态类
                node.classList.remove('activated', 'light-activated');
                
                // 根据值设置激活状态
                if (sum >= 2) {
                    node.classList.add('activated'); // 完全激活
                } else if (sum === 1) {
                    node.classList.add('light-activated'); // 轻微激活
                }
                // sum = 0 时保持默认灰色状态
            }
        }
        
        hiddenProcessed = true;
        
        // 更新连线激活状态
        updateConnectionStates();
        
    } else if (!outputProcessed) {
        // Second click: Calculate output layer
        outputOutputs = [];
        
        for (let o = 0; o < 2; o++) {
            let outputValue = 0;
            
            // 检查连接到这个output节点的hidden节点
            for (let h = 0; h < 4; h++) {
                if (weights.hiddenToOutputConnections[h][o]) {
                    // 如果连接的hidden layer node数值>1，则输出1，否则输出0
                    if (hiddenOutputs[h] > 1) {
                        outputValue = 1;
                        break; // 只要有一个连接的hidden节点>1，就输出1
                    }
                }
            }
            
            outputOutputs.push(outputValue);
            
            // Update node display
            const node = document.getElementById(`output-${o}`);
            const valueDiv = document.getElementById(`output-value-${o}`);
            if (node && valueDiv) {
                valueDiv.textContent = outputValue.toString();
                
                // 清除所有状态类
                node.classList.remove('activated', 'light-activated');
                
                // 如果值为1，添加激活状态
                if (outputValue === 1) {
                    node.classList.add('activated');
                    
                    // 同时激活对应的输出到结果面板的连线
                    const outputPredictionLine = document.querySelector(`.output-prediction[data-output="${o}"]`);
                    if (outputPredictionLine) {
                        outputPredictionLine.classList.add('activated');
                    }
                }
            }
        }
        
        // Determine result based on output layer values
        let result;
        const output0 = outputOutputs[0]; // 第一个节点
        const output1 = outputOutputs[1]; // 第二个节点
        
        if (output0 === 1 && output1 === 0) {
            result = '一'; // 仅第一个节点是1
        } else if (output0 === 0 && output1 === 1) {
            result = '1'; // 仅第二个节点是1
        } else if (output0 === 1 && output1 === 1) {
            result = '一 or 1'; // 都是1
        } else { // output0 === 0 && output1 === 0
            result = '一 or 1'; // 都是0
        }
        
        // Update final prediction
        const predictionDiv = document.getElementById('prediction');
        if (predictionDiv) predictionDiv.textContent = result;
        
        outputProcessed = true;
        
        // 更新连线激活状态
        updateConnectionStates();
        
        // 预测完成后，按钮变灰
        buttonState = 'completed';
        updateButtonState();
    }
}

function updateConnectionStates() {
    // 重置所有连线状态
    document.querySelectorAll('.grid-input-connection').forEach(line => {
        line.classList.remove('activated');
    });
    
    document.querySelectorAll('.connection').forEach(connection => {
        connection.classList.remove('activated', 'light-activated');
    });
    
    document.querySelectorAll('.weight-label').forEach(label => {
        label.classList.remove('activated', 'light-activated');
    });
    
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('activated');
    });
    
    // 1. 激活网格到输入层的连线（当方块被点击且对应输入节点激活时）
    currentInput.forEach((value, index) => {
        // 找到与当前方块相关的三条连线
        const h1 = document.getElementById(`grid-input-${index}-h1`);
        const v = document.getElementById(`grid-input-${index}-v`);
        const h2 = document.getElementById(`grid-input-${index}-h2`);
        
        if (value === 1) {
            // 只激活当前方块对应的连线
            if (h1) h1.classList.add('activated');
            if (v) v.classList.add('activated');
            if (h2) h2.classList.add('activated');
        }
    });
    
    // 2. 激活输入层到隐藏层的连线
    if (hiddenProcessed) {
        for (let i = 0; i < 4; i++) {
            for (let h = 0; h < 4; h++) {
                const inputValue = currentInput[i];
                const weight = weights.inputToHidden[i][h];
                const hiddenValue = hiddenOutputs[h];
                
                // 判断连线是否应该激活
                let shouldActivate = false;
                let activationLevel = 'none';
                
                if (inputValue === 1 && weight > 0) {
                    if (hiddenValue >= 2) {
                        shouldActivate = true;
                        activationLevel = 'activated';
                    } else if (hiddenValue === 1) {
                        shouldActivate = true;
                        activationLevel = 'light-activated';
                    }
                }
                
                if (shouldActivate) {
                    const connection = document.getElementById(`connection-input-${i}-hidden-${h}`);
                    const label = document.getElementById(`label-input-${i}-hidden-${h}`);
                    
                    if (connection) {
                        connection.classList.add(activationLevel);
                    }
                    if (label) {
                        label.classList.add(activationLevel);
                    }
                }
            }
        }
    }
    
    // 3. 激活隐藏层到输出层的连线
    if (outputProcessed) {
        for (let h = 0; h < 4; h++) {
            for (let o = 0; o < 2; o++) {
                if (weights.hiddenToOutputConnections[h][o]) {
                    const hiddenValue = hiddenOutputs[h];
                    const outputValue = outputOutputs[o];
                    
                    // 如果隐藏节点激活且输出节点激活，则激活连线
                    if ((hiddenValue >= 1) && (outputValue === 1)) {
                        const connection = document.getElementById(`connection-hidden-${h}-output-${o}`);
                        const label = document.getElementById(`label-hidden-${h}-output-${o}`);
                        
                        if (connection) {
                            connection.classList.add('activated');
                        }
                        if (label) {
                            label.classList.add('activated');
                        }
                    }
                }
            }
        }
    }
    
    // 4. 激活输出层到结果面板的连线
    if (outputProcessed) {
        document.querySelectorAll('.output-prediction').forEach((line, index) => {
            if (outputOutputs[index] === 1) {
                line.classList.add('activated');
            }
        });
    }
}

function clearGrid() {
    currentInput = [0, 0, 0, 0];
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('filled');
    });
    
    // Reset all states
    hiddenProcessed = false;
    outputProcessed = false;
    buttonState = 'ready';
    
    // Reset prediction and its connection lines
    const predictionDiv = document.getElementById('prediction');
    if (predictionDiv) predictionDiv.textContent = '?';
    
    // Reset output-prediction lines
    document.querySelectorAll('.output-prediction').forEach(line => {
        line.classList.remove('activated');
    });
    
    updateInputNodes();
    
    // Reset all connection states
    updateConnectionStates();
}

function updateButtonState() {
    const button = document.getElementById('main-btn');
    const hasInput = currentInput.some(val => val === 1);
    
    if (buttonState === 'ready') {
        if (hasInput) {
            button.textContent = 'Calculate';
            button.classList.remove('disabled');
            buttonState = 'calculate';
        } else {
            button.textContent = 'Ready';
            button.classList.add('disabled');
        }
    } else if (buttonState === 'clear') {
        button.textContent = 'Clear';
        button.classList.remove('disabled');
    } else if (buttonState === 'completed') {
        // 预测完成后，按钮变灰并显示Complete
        button.textContent = 'Complete';
        button.classList.add('disabled');
    }
}

function handleButtonClick() {
    const button = document.getElementById('main-btn');
    
    if (button.classList.contains('disabled')) {
        return; // 按钮被禁用时不执行任何操作
    }
    
    if (buttonState === 'calculate') {
        if (!hiddenProcessed) {
            // 第一次点击：计算hidden layer
            processHiddenLayer();
        } else if (!outputProcessed) {
            // 第二次点击：计算output layer
            processHiddenLayer(); // 这个函数会处理output layer
            // buttonState会在processHiddenLayer中设置为'completed'
        }
    } else if (buttonState === 'clear') {
        clearGrid();
    }
}

function resetNetwork() {
    currentLayer = 'none';
    hiddenOutputs = [];
    outputOutputs = [];
    calculations = [];
    
    // Reset all nodes to default state
    document.querySelectorAll('.node').forEach(node => {
        node.classList.remove('processing');
    });
    
    // Reset hidden nodes to labels
    const labels = ['left-vertical', 'right-vertical', 'top-horizontal', 'bottom-horizontal'];
    for (let i = 0; i < 4; i++) {
        const node = document.getElementById(`hidden-${i}`);
        if (node) {
            node.textContent = labels[i];
            node.style.background = 'linear-gradient(45deg, #fef5e7, #fed7aa)';
        }
    }
    
    // Reset output nodes to labels
    const output0 = document.getElementById('output-0');
    const output1 = document.getElementById('output-1');
    if (output0) {
        output0.textContent = '"一"';
        output0.style.background = 'linear-gradient(45deg, #f0fff4, #c6f6d5)';
    }
    if (output1) {
        output1.textContent = '"1"';
        output1.style.background = 'linear-gradient(45deg, #f0fff4, #c6f6d5)';
    }
    
    // Update button states - check if buttons exist first
    const inputBtn = document.getElementById('input-btn');
    const hiddenBtn = document.getElementById('hidden-btn');
    const outputBtn = document.getElementById('output-btn');
    
    if (inputBtn) inputBtn.disabled = false;
    if (hiddenBtn) hiddenBtn.disabled = true;
    if (outputBtn) outputBtn.disabled = true;
    

    
    const predictionDiv = document.getElementById('prediction');
    const confidenceDiv = document.getElementById('confidence');
    if (predictionDiv) predictionDiv.textContent = '?';
    if (confidenceDiv) confidenceDiv.textContent = 'Process the network!';
}



function drawConnections() {
    const network = document.getElementById('network');
    
    // Clear existing connections
    document.querySelectorAll('.connection').forEach(conn => conn.remove());
    document.querySelectorAll('.weight-label').forEach(label => label.remove());
    
    // Input to Hidden connections
    for (let i = 0; i < 4; i++) {
        for (let h = 0; h < 4; h++) { // Changed to 4 hidden nodes
            const inputNode = document.getElementById(`input-${i}`);
            const hiddenNode = document.getElementById(`hidden-${h}`);
            
            const inputRect = inputNode.getBoundingClientRect();
            const hiddenRect = hiddenNode.getBoundingClientRect();
            const networkRect = network.getBoundingClientRect();
            
            const startX = inputRect.right - networkRect.left - 10;
            const startY = inputRect.top + inputRect.height/2 - networkRect.top;
            const endX = hiddenRect.left - networkRect.left + 10;
            const endY = hiddenRect.top + hiddenRect.height/2 - networkRect.top;
            
            const length = Math.sqrt((endX - startX)**2 + (endY - startY)**2);
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
            
            const connection = document.createElement('div');
            connection.className = 'connection';
            connection.id = `connection-input-${i}-hidden-${h}`;
            connection.style.left = startX + 'px';
            connection.style.top = startY + 'px';
            connection.style.width = length + 'px';
            connection.style.transform = `rotate(${angle}deg)`;
            
            const weight = weights.inputToHidden[i][h];
            
            // Weight label - 错开位置避免视觉干扰
            const weightLabel = document.createElement('div');
            weightLabel.className = 'weight-label';
            weightLabel.id = `label-input-${i}-hidden-${h}`;
            weightLabel.textContent = weight.toString();
            // 根据连线索引决定位置：偶数索引靠左30%，奇数索引靠右30%
            const labelPosition = (i + h) % 2 === 0 ? 0.2 : 0.8;
            weightLabel.style.left = (startX + (endX - startX) * labelPosition) + 'px';
            weightLabel.style.top = (startY + (endY - startY) * labelPosition) + 'px';
            
            network.appendChild(connection);
            network.appendChild(weightLabel);
        }
    }
    
    // Hidden to Output connections - 只绘制指定的连接
    for (let h = 0; h < 4; h++) {
        for (let o = 0; o < 2; o++) {
            // 检查是否应该绘制这条连线
            if (!weights.hiddenToOutputConnections[h][o]) {
                continue; // 跳过不需要的连线
            }
            
            const hiddenNode = document.getElementById(`hidden-${h}`);
            const outputNode = document.getElementById(`output-${o}`);
            
            const hiddenRect = hiddenNode.getBoundingClientRect();
            const outputRect = outputNode.getBoundingClientRect();
            const networkRect = network.getBoundingClientRect();
            
            const startX = hiddenRect.right - networkRect.left - 10;
            const startY = hiddenRect.top + hiddenRect.height/2 - networkRect.top;
            const endX = outputRect.left - networkRect.left + 10;
            const endY = outputRect.top + outputRect.height/2 - networkRect.top;
            
            const length = Math.sqrt((endX - startX)**2 + (endY - startY)**2);
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
            
            const connection = document.createElement('div');
            connection.className = 'connection';
            connection.id = `connection-hidden-${h}-output-${o}`;
            connection.style.left = startX + 'px';
            connection.style.top = startY + 'px';
            connection.style.width = length + 'px';
            connection.style.transform = `rotate(${angle}deg)`;
            
            // Function label - 显示"f"而不是权重
            const functionLabel = document.createElement('div');
            functionLabel.className = 'weight-label';
            functionLabel.id = `label-hidden-${h}-output-${o}`;
            functionLabel.textContent = 'f';
            // 根据连线索引决定位置
            const labelPosition = (h + o) % 2 === 0 ? 0.2 : 0.8;
            functionLabel.style.left = (startX + (endX - startX) * labelPosition) + 'px';
            functionLabel.style.top = (startY + (endY - startY) * labelPosition) + 'px';
            
            network.appendChild(connection);
            network.appendChild(functionLabel);
        }
    }
}

// 绘制网格到输入层的连接线
function drawGridToInputConnections() {
    const grid = document.getElementById('grid');
    const network = document.getElementById('network');
    
    if (!grid || !network) return;
    
    const gridRect = grid.getBoundingClientRect();
    const networkRect = network.getBoundingClientRect();
    const containerRect = document.querySelector('.container').getBoundingClientRect();
    
    // 获取网格单元格
    const gridCells = document.querySelectorAll('.grid-cell');
    
    // 清除现有的连接线
    document.querySelectorAll('.grid-input-connection').forEach(el => el.remove());
    
    gridCells.forEach((cell, index) => {
        const cellRect = cell.getBoundingClientRect();
        const inputNode = document.getElementById(`input-${index}`);
        
        if (!inputNode) return;
        
        const inputRect = inputNode.getBoundingClientRect();
        
        // 计算圆圈的精确连接点（正左边）
        const endX = inputRect.left - containerRect.left;
        const endY = inputRect.top + inputRect.height/2 - containerRect.top;
        
        // 根据方格位置确定连接线起点和路径
        let startX, startY;
        
        if (index === 0) {
            // 左上方格：从上边中心出发，向上→向右（连接到input-0）
            startX = cellRect.left + cellRect.width/2 - containerRect.left;
            startY = cellRect.top - containerRect.top;
            
            // 获取input-0的位置（第1个圆圈）
            const targetNode = document.getElementById('input-0');
            const targetRect = targetNode.getBoundingClientRect();
            const targetX = targetRect.left - containerRect.left;
            const targetY = targetRect.top + targetRect.height/2 - containerRect.top;
            
            // 创建向上的垂直线，到目标圆圈的水平高度
            const verticalLine = document.createElement('div');
            verticalLine.className = 'connection-line grid-input-connection';
            verticalLine.id = `grid-input-${index}-v`;
            verticalLine.style.left = startX + 'px';
            verticalLine.style.top = targetY + 'px';
            verticalLine.style.height = Math.abs(startY - targetY) + 'px';
            verticalLine.style.width = '2px';
            document.querySelector('.grid-to-input-connections').appendChild(verticalLine);
            
            // 创建水平线，直接连接到目标圆形
            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'connection-line grid-input-connection';
            horizontalLine.id = `grid-input-${index}-h2`; // 只需要一条水平线，用h2
            horizontalLine.style.left = startX + 'px';
            horizontalLine.style.top = targetY + 'px';
            horizontalLine.style.width = (targetX - startX) + 'px';
            horizontalLine.style.transform = 'rotate(0deg)';
            document.querySelector('.grid-to-input-connections').appendChild(horizontalLine);
            
        } else if (index === 2) {
            // 左下方格：从下边中心出发（连接到input-2）
            startX = cellRect.left + cellRect.width/2 - containerRect.left;
            startY = cellRect.bottom - containerRect.top;
            
            // 获取input-2的位置（第3个圆圈）
            const targetNode = document.getElementById('input-2');
            const targetRect = targetNode.getBoundingClientRect();
            const targetX = targetRect.left - containerRect.left;
            const targetY = targetRect.top + targetRect.height/2 - containerRect.top;
            
            // 创建向下的垂直线，到目标圆圈的水平高度
            const verticalLine = document.createElement('div');
            verticalLine.className = 'connection-line grid-input-connection';
            verticalLine.id = `grid-input-${index}-v`;
            verticalLine.style.left = startX + 'px';
            verticalLine.style.top = startY + 'px';
            verticalLine.style.height = Math.abs(targetY - startY) + 'px';
            verticalLine.style.width = '2px';
            document.querySelector('.grid-to-input-connections').appendChild(verticalLine);
            
            // 创建水平线，直接连接到目标圆形
            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'connection-line grid-input-connection';
            horizontalLine.id = `grid-input-${index}-h2`; // 只需要一条水平线，用h2
            horizontalLine.style.left = startX + 'px';
            horizontalLine.style.top = targetY + 'px';
            horizontalLine.style.width = (targetX - startX) + 'px';
            horizontalLine.style.transform = 'rotate(0deg)';
            document.querySelector('.grid-to-input-connections').appendChild(horizontalLine);
            
        } else {
            // 右上和右下方格：从右边中心出发
            startX = cellRect.right - containerRect.left;
            startY = cellRect.top + cellRect.height/2 - containerRect.top;
            
            // 获取对应的目标圆圈位置
            const targetNodeId = index === 1 ? 'input-1' : 'input-3';
            const targetNode = document.getElementById(targetNodeId);
            const targetRect = targetNode.getBoundingClientRect();
            const targetX = targetRect.left - containerRect.left;
            const targetY = targetRect.top + targetRect.height/2 - containerRect.top;
            
            if (index === 1) {
                // 右上方块：如果与目标圆圈水平对齐，则直接连一条水平线
                if (Math.abs(startY - targetY) < 5) { // 允许5px的误差
                    const horizontalLine = document.createElement('div');
                    horizontalLine.className = 'connection-line grid-input-connection';
                    horizontalLine.style.left = startX + 'px';
                    horizontalLine.style.top = startY + 'px';
                    horizontalLine.style.width = (targetX - startX) + 'px';
                    horizontalLine.style.transform = 'rotate(0deg)';
                    document.querySelector('.grid-to-input-connections').appendChild(horizontalLine);
                } else {
                    // 如果不对齐，使用折线
                    const horizontalOffset = 40;
                    
                    const horizontalLine1 = document.createElement('div');
                    horizontalLine1.className = 'connection-line grid-input-connection';
                    horizontalLine1.id = `grid-input-${index}-h1`;
                    horizontalLine1.style.left = startX + 'px';
                    horizontalLine1.style.top = startY + 'px';
                    horizontalLine1.style.width = horizontalOffset + 'px';
                    horizontalLine1.style.transform = 'rotate(0deg)';
                    document.querySelector('.grid-to-input-connections').appendChild(horizontalLine1);
                    
                    const verticalLine = document.createElement('div');
                    verticalLine.className = 'connection-line grid-input-connection';
                    verticalLine.id = `grid-input-${index}-v`;
                    verticalLine.style.left = (startX + horizontalOffset) + 'px';
                    verticalLine.style.top = Math.min(startY, targetY) + 'px';
                    verticalLine.style.height = Math.abs(targetY - startY) + 'px';
                    verticalLine.style.width = '2px';
                    document.querySelector('.grid-to-input-connections').appendChild(verticalLine);
                    
                    const horizontalLine2 = document.createElement('div');
                    horizontalLine2.className = 'connection-line grid-input-connection';
                    horizontalLine2.id = `grid-input-${index}-h2`;
                    horizontalLine2.style.left = (startX + horizontalOffset) + 'px';
                    horizontalLine2.style.top = targetY + 'px';
                    horizontalLine2.style.width = (targetX - startX - horizontalOffset) + 'px';
                    horizontalLine2.style.transform = 'rotate(0deg)';
                    document.querySelector('.grid-to-input-connections').appendChild(horizontalLine2);
                }
            } else {
                // 右下方块：使用折线连接
                const horizontalOffset = 40;
                
                const horizontalLine1 = document.createElement('div');
                horizontalLine1.className = 'connection-line grid-input-connection';
                horizontalLine1.id = `grid-input-${index}-h1`;
                horizontalLine1.style.left = startX + 'px';
                horizontalLine1.style.top = startY + 'px';
                horizontalLine1.style.width = horizontalOffset + 'px';
                horizontalLine1.style.transform = 'rotate(0deg)';
                document.querySelector('.grid-to-input-connections').appendChild(horizontalLine1);
                
                const verticalLine = document.createElement('div');
                verticalLine.className = 'connection-line grid-input-connection';
                verticalLine.id = `grid-input-${index}-v`;
                verticalLine.style.left = (startX + horizontalOffset) + 'px';
                verticalLine.style.top = Math.min(startY, targetY) + 'px';
                verticalLine.style.height = Math.abs(targetY - startY) + 'px';
                verticalLine.style.width = '2px';
                document.querySelector('.grid-to-input-connections').appendChild(verticalLine);
                
                const horizontalLine2 = document.createElement('div');
                horizontalLine2.className = 'connection-line grid-input-connection';
                horizontalLine2.id = `grid-input-${index}-h2`;
                horizontalLine2.style.left = (startX + horizontalOffset) + 'px';
                horizontalLine2.style.top = targetY + 'px';
                horizontalLine2.style.width = (targetX - startX - horizontalOffset) + 'px';
                horizontalLine2.style.transform = 'rotate(0deg)';
                document.querySelector('.grid-to-input-connections').appendChild(horizontalLine2);
            }
        }
    });
}

// 绘制输出层到预测面板的连接线
function drawOutputToPredictionConnections() {
    const network = document.getElementById('network');
    const resultBox = document.querySelector('.result-box');
    
    if (!network || !resultBox) return;
    
    const networkRect = network.getBoundingClientRect();
    const resultRect = resultBox.getBoundingClientRect();
    const containerRect = document.querySelector('.container').getBoundingClientRect();
    
    // 获取输出节点
    const outputNodes = document.querySelectorAll('.output-node');
    
    outputNodes.forEach((node, index) => {
        const nodeRect = node.getBoundingClientRect();
        
        // 计算连接线起点（输出节点右侧中心）
        const startX = nodeRect.right - containerRect.left;
        const startY = nodeRect.top + nodeRect.height/2 - containerRect.top;
        
        // 计算连接线终点（预测面板左侧中心）
        const endX = resultRect.left - containerRect.left;
        const endY = resultRect.top + resultRect.height/2 - containerRect.top;
        
        // 计算连接线长度和角度
        const length = Math.sqrt((endX - startX)**2 + (endY - startY)**2);
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        // 获取或创建连接线元素
        let connectionLine = document.getElementById(`output-prediction-${index}`);
        if (!connectionLine) {
            connectionLine = document.createElement('div');
            connectionLine.className = 'connection-line output-prediction';
            connectionLine.id = `output-prediction-${index}`;
            document.querySelector('.output-to-prediction-connections').appendChild(connectionLine);
        }
        
        // 设置连接线样式
        connectionLine.style.left = startX + 'px';
        connectionLine.style.top = startY + 'px';
        connectionLine.style.width = length + 'px';
        connectionLine.style.transform = `rotate(${angle}deg)`;
    });
}

// Initialize everything when page loads
window.addEventListener('load', () => {
    initGrid();
    updateInputNodes();
    
    // Initialize button state
    updateButtonState();
    
    // 绘制所有连接线
    setTimeout(() => {
        drawConnections();
        drawGridToInputConnections();
        drawOutputToPredictionConnections();
    }, 100);
    
    // Redraw connections on window resize
    window.addEventListener('resize', () => {
        setTimeout(() => {
            drawConnections();
            drawGridToInputConnections();
            drawOutputToPredictionConnections();
        }, 100);
    });
});