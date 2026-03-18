// 应用主逻辑

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

// 发送消息
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatInput.value = '';
    setLoading(true);

    setTimeout(() => {
        const response = searchKnowledge(message);
        addMessage(response, 'bot');
        setLoading(false);
    }, 500);
}

// 搜索知识库
function searchKnowledge(query) {
    query = query.toLowerCase();
    
    let results = [];
    
    // 遍历所有故障类别
    for (const category of knowledgeBase.faults) {
        for (const item of category.items) {
            // 检查症状是否匹配
            if (item.symptom.toLowerCase().includes(query) || 
                query.includes(item.symptom.toLowerCase())) {
                results.push({
                    category: category.category,
                    symptom: item.symptom,
                    causes: item.causes,
                    solutions: item.solutions
                });
            }
            
            // 检查原因是否匹配
            for (const cause of item.causes) {
                if (cause.toLowerCase().includes(query) || 
                    query.includes(cause.toLowerCase())) {
                    results.push({
                        category: category.category,
                        symptom: item.symptom,
                        causes: item.causes,
                        solutions: item.solutions
                    });
                    break;
                }
            }
        }
    }
    
    // 去重
    const uniqueResults = [];
    const seen = new Set();
    for (const result of results) {
        const key = result.category + '-' + result.symptom;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(result);
        }
    }
    
    if (uniqueResults.length > 0) {
        return formatResults(uniqueResults);
    } else {
        return formatNoResult();
    }
}

// 格式化结果
function formatResults(results) {
    let html = '';
    
    for (const result of results) {
        html += `<div class="category-tag">${result.category}</div>`;
        html += `<strong>【故障现象】${result.symptom}</strong><br><br>`;
        
        html += `<strong>可能原因：</strong><br>`;
        result.causes.forEach((cause, i) => {
            html += `${i + 1}. ${cause}<br>`;
        });
        
        html += `<br><strong>推荐解决方案：</strong><br>`;
        result.solutions.forEach((solution, i) => {
            // 处理多步骤方案
            if (solution.includes('\\n')) {
                const steps = solution.split('\\n');
                steps.forEach((step, j) => {
                    html += `${i + 1}.${j + 1}. ${step}<br>`;
                });
            } else {
                html += `${i + 1}. ${solution}<br>`;
            }
        });
        
        html += `<br><hr style="margin: 15px 0; border: none; border-top: 1px solid #e9ecef;"><br>`;
    }
    
    return html;
}

// 格式化无结果
function formatNoResult() {
    let html = `<div style="background: #fff3cd; padding: 15px; border-radius: 10px; color: #856404;">`;
    html += `<strong>😕 抱歉，没有找到匹配的故障</strong><br><br>`;
    html += `您可以尝试：<br>`;
    html += `• 使用更简单的关键词（如"黑屏"、"离线"、"充电慢"）<br>`;
    html += `• 查看快捷问题<br>`;
    html += `• 联系技术支持获取帮助`;
    html += `</div>`;
    return html;
}

// 添加消息到聊天
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = `avatar ${type}-avatar`;
    avatar.textContent = type === 'bot' ? '🤖' : '👷';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;
    
    if (type === 'bot') {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
    } else {
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(avatar);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 快捷问题
function sendQuick(question) {
    chatInput.value = question;
    sendMessage();
}

// 回车发送
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 设置加载状态
function setLoading(loading) {
    sendButton.disabled = loading;
    sendButton.textContent = loading ? '发送中...' : '发送';
    chatInput.disabled = loading;
}
