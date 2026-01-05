(function() {
  'use strict';
  
  // Get configuration from script tag
  const script = document.currentScript;
  const config = {
    chatbotId: script?.getAttribute('chatbot-id') || window.botsmithConfig?.chatbotId,
    domain: script?.getAttribute('domain') || window.botsmithConfig?.domain || window.location.origin,
    position: script?.getAttribute('position') || 'bottom-right',
    theme: script?.getAttribute('theme') || 'purple',
    apiUrl: script?.getAttribute('api-url') || (script?.getAttribute('domain') || window.location.origin) + '/api'
  };
  
  if (!config.chatbotId) {
    console.error('BotSmith Widget: chatbot-id is required');
    return;
  }
  
  // Theme colors with enhanced gradients
  const themes = {
    purple: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#c084fc' },
    blue: { primary: '#3b82f6', secondary: '#06b6d4', accent: '#0ea5e9' },
    green: { primary: '#10b981', secondary: '#14b8a6', accent: '#34d399' },
    orange: { primary: '#f97316', secondary: '#f59e0b', accent: '#fb923c' },
    pink: { primary: '#ec4899', secondary: '#f43f5e', accent: '#f472b6' }
  };
  
  const currentTheme = themes[config.theme] || themes.purple;
  
  // Session ID
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // State
  let isOpen = false;
  let messages = [];
  let chatbot = null;
  let isLoading = false;
  let isSending = false;
  
  // Customization defaults
  let customization = {
    accent_color: '#ec4899',
    font_family: 'Inter, system-ui, -apple-system, sans-serif',
    font_size: 'medium',
    bubble_style: 'rounded'
  };
  
  // Position styles
  const positions = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' }
  };
  
  const currentPosition = positions[config.position] || positions['bottom-right'];

  // Inject enhanced styles with beautiful animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(40px) scale(0.94); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    @keyframes messageSlideIn {
      from { 
        opacity: 0; 
        transform: translateY(15px) scale(0.96);
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-12px); }
      60% { transform: translateY(-6px); }
    }
    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
      40% { transform: translateY(-10px); opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4); }
      50% { box-shadow: 0 8px 35px rgba(124, 58, 237, 0.65); }
    }
    
    #botsmith-container * { 
      box-sizing: border-box; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif;
    }
    
    .botsmith-bubble { 
      animation: glow 3s ease-in-out infinite;
      backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .botsmith-bubble:hover {
      transform: scale(1.12) !important;
      animation: none;
    }
    
    .botsmith-message-item {
      animation: messageSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .botsmith-typing-dot {
      width: 8px; 
      height: 8px; 
      border-radius: 50%;
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      display: inline-block;
      margin: 0 3px; 
      animation: dotBounce 1.4s infinite ease-in-out;
    }
    
    .botsmith-typing-dot:nth-child(1) { animation-delay: 0s; }
    .botsmith-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .botsmith-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    #botsmith-messages {
      scroll-behavior: smooth;
    }
    
    #botsmith-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    #botsmith-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    
    #botsmith-messages::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 10px;
    }
    
    #botsmith-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.25);
    }
    
    #botsmith-input:focus {
      border-color: ${currentTheme.primary} !important;
      box-shadow: 0 0 0 3px ${currentTheme.primary}20 !important;
      transition: all 0.3s ease;
    }
    
    .botsmith-send-button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .botsmith-send-button:hover {
      transform: scale(1.1) rotate(5deg);
    }
    
    .botsmith-send-button:active {
      transform: scale(0.95);
    }
    
    @media (max-width: 768px) {
      #botsmith-window {
        width: 100vw !important; 
        height: 100vh !important;
        bottom: 0 !important; 
        right: 0 !important; 
        left: 0 !important; 
        top: 0 !important;
        border-radius: 0 !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Create container
  const container = document.createElement('div');
  container.id = 'botsmith-container';
  
  function updateContainerStyle() {
    container.style.cssText = `
      position: fixed;
      ${currentPosition.bottom ? `bottom: ${currentPosition.bottom};` : ''}
      ${currentPosition.top ? `top: ${currentPosition.top};` : ''}
      ${currentPosition.left ? `left: ${currentPosition.left};` : ''}
      ${currentPosition.right ? `right: ${currentPosition.right};` : ''}
      z-index: 999999;
      font-family: ${customization.font_family};
    `;
  }
  updateContainerStyle();

  // Create chat bubble with enhanced design
  const bubble = document.createElement('button');
  bubble.className = 'botsmith-bubble';
  bubble.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white"/>
    </svg>
  `;
  bubble.style.cssText = `
    width: 64px; 
    height: 64px; 
    border-radius: 50%;
    background: linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 50%, ${currentTheme.accent || currentTheme.secondary} 100%);
    border: none; 
    cursor: pointer; 
    box-shadow: 0 8px 25px ${currentTheme.primary}50, 0 4px 12px ${currentTheme.primary}30;
    display: flex; 
    align-items: center; 
    justify-content: center;
    position: relative;
    overflow: hidden;
  `;
  
  bubble.onmouseenter = () => {
    bubble.style.boxShadow = `0 12px 35px ${currentTheme.primary}65, 0 6px 16px ${currentTheme.primary}40`;
  };
  bubble.onmouseleave = () => {
    bubble.style.boxShadow = `0 8px 25px ${currentTheme.primary}50, 0 4px 12px ${currentTheme.primary}30`;
  };

  // Create chat window with glassmorphism effect
  const chatWindow = document.createElement('div');
  chatWindow.id = 'botsmith-window';
  const windowPosition = config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;';
  const windowAlign = config.position.includes('right') ? 'right: 0;' : 'left: 0;';
  
  chatWindow.style.cssText = `
    position: fixed; 
    ${windowPosition} 
    ${windowAlign}
    width: 420px; 
    height: 600px; 
    max-width: calc(100vw - 40px); 
    max-height: calc(100vh - 120px);
    background: white; 
    border-radius: 24px; 
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.18), 0 10px 30px rgba(0, 0, 0, 0.1);
    display: none; 
    flex-direction: column; 
    overflow: hidden; 
    animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(255, 255, 255, 0.8);
  `;

  // Header with gradient and better design
  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 60%, ${currentTheme.accent || currentTheme.secondary} 100%);
    color: white; 
    padding: 24px; 
    display: flex; 
    align-items: center; 
    justify-content: space-between;
    box-shadow: 0 4px 20px ${currentTheme.primary}30;
    position: relative;
    overflow: hidden;
  `;
  
  // Add subtle pattern overlay to header
  const headerOverlay = document.createElement('div');
  headerOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  `;
  header.appendChild(headerOverlay);
  
  header.innerHTML += `
    <div style="display: flex; align-items: center; gap: 14px; flex: 1; position: relative; z-index: 1;">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${currentTheme.primary}" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 17px; letter-spacing: -0.3px;" id="botsmith-header-title">Chat Support</div>
        <div style="font-size: 13px; opacity: 0.95; font-weight: 500;">We're here to help!</div>
      </div>
    </div>
    <button id="botsmith-close" style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); color: white; cursor: pointer; padding: 10px; display: flex; border-radius: 12px; transition: all 0.3s; position: relative; z-index: 1;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  
  const closeBtn = header.querySelector('#botsmith-close');
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    closeBtn.style.transform = 'scale(1.05)';
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    closeBtn.style.transform = 'scale(1)';
  };

  // Messages container with better design
  const messagesContainer = document.createElement('div');
  messagesContainer.id = 'botsmith-messages';
  messagesContainer.style.cssText = `
    flex: 1; 
    overflow-y: auto; 
    padding: 24px; 
    background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
    display: flex; 
    flex-direction: column; 
    gap: 16px;
  `;

  // Input area with modern design
  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
    border-top: 1px solid #e5e7eb; 
    padding: 16px 20px; 
    background: white;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  `;
  inputArea.innerHTML = `
    <form id="botsmith-form" style="display: flex; gap: 10px; margin: 0;">
      <input 
        type="text" 
        id="botsmith-input" 
        placeholder="Type your message..."
        style="flex: 1; padding: 12px 18px; border: 2px solid #e5e7eb; border-radius: 28px; outline: none; font-size: 15px; transition: all 0.3s ease; background: #fafafa;"
      />
      <button 
        type="submit" 
        id="botsmith-send" 
        class="botsmith-send-button"
        style="width: 48px; height: 48px; border-radius: 50%; border: none; background: linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px ${customization.accent_color}40;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </form>
  `;

  // Branding footer with elegant design
  const brandingFooter = document.createElement('div');
  brandingFooter.style.cssText = `
    padding: 10px 16px; 
    background: linear-gradient(to top, #fafafa 0%, #f9fafb 100%); 
    text-align: center; 
    border-top: 1px solid #f0f0f0;
  `;
  brandingFooter.innerHTML = `
    <a href="https://botsmith.io" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #9ca3af; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.3s; font-weight: 500;">
      <span>Powered by</span>
      <span style="font-weight: 700; color: ${currentTheme.primary}; letter-spacing: 0.3px;">BotSmith</span>
    </a>
  `;
  
  // Add hover effect
  const brandingLink = brandingFooter.querySelector('a');
  brandingLink.addEventListener('mouseenter', () => {
    brandingLink.style.color = currentTheme.primary;
    brandingLink.style.transform = 'translateY(-1px)';
  });
  brandingLink.addEventListener('mouseleave', () => {
    brandingLink.style.color = '#9ca3af';
    brandingLink.style.transform = 'translateY(0)';
  });

  // Assemble window
  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputArea);
  chatWindow.appendChild(brandingFooter);

  // Assemble container
  container.appendChild(bubble);
  container.appendChild(chatWindow);

  // Add to DOM
  document.body.appendChild(container);

  // Functions
  function addMessage(role, content) {
    messages.push({ role, content, timestamp: new Date() });
    renderMessages();
  }

  function getBubbleRadius() {
    const styles = {
      'rounded': '20px',
      'smooth': '14px',
      'square': '6px'
    };
    return styles[customization.bubble_style] || '20px';
  }
  
  function getFontSize() {
    const sizes = {
      'small': '14px',
      'medium': '15px',
      'large': '17px'
    };
    return sizes[customization.font_size] || '15px';
  }

  function renderMessages() {
    messagesContainer.innerHTML = '';
    const bubbleRadius = getBubbleRadius();
    const fontSize = getFontSize();
    
    messages.forEach((msg, index) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'botsmith-message-item';
      msgDiv.style.cssText = `
        display: flex; 
        gap: 10px; 
        align-items: flex-start;
        ${msg.role === 'user' ? 'justify-content: flex-end;' : ''}
        animation-delay: ${index === messages.length - 1 ? '0s' : '0s'};
      `;
      
      if (msg.role === 'assistant') {
        const avatarContent = chatbot?.avatar_url 
          ? `<img src="${chatbot.avatar_url}" alt="Bot" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>`;
            
        msgDiv.innerHTML = `
          <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; box-shadow: 0 3px 10px ${customization.accent_color}30;">
            ${avatarContent}
          </div>
          <div style="max-width: 72%; padding: 14px 18px; border-radius: ${bubbleRadius}; background: white; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05); word-wrap: break-word; font-size: ${fontSize}; line-height: 1.6; font-family: ${customization.font_family}; border: 1px solid rgba(0, 0, 0, 0.05);">
            ${msg.content}
          </div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div style="max-width: 72%; padding: 14px 18px; border-radius: ${bubbleRadius}; background: linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%); color: white; box-shadow: 0 3px 12px ${customization.accent_color}35, 0 1px 3px ${customization.accent_color}25; word-wrap: break-word; font-size: ${fontSize}; line-height: 1.6; font-family: ${customization.font_family}; font-weight: 500;">
            ${msg.content}
          </div>
        `;
      }
      
      messagesContainer.appendChild(msgDiv);
    });
    
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'botsmith-typing-indicator';
    typingDiv.className = 'botsmith-message-item';
    typingDiv.style.cssText = 'display: flex; gap: 10px; align-items: center;';
    
    const bubbleRadius = getBubbleRadius();
    
    const avatarContent = chatbot?.avatar_url 
      ? `<img src="${chatbot.avatar_url}" alt="Bot" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>`;
    
    typingDiv.innerHTML = `
      <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%); display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 3px 10px ${customization.accent_color}30;">
        ${avatarContent}
      </div>
      <div style="padding: 14px 18px; border-radius: ${bubbleRadius}; background: white; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.05);">
        <span class="botsmith-typing-dot"></span>
        <span class="botsmith-typing-dot"></span>
        <span class="botsmith-typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function hideTyping() {
    const typing = document.getElementById('botsmith-typing-indicator');
    if (typing) typing.remove();
  }

  async function loadChatbot() {
    try {
      isLoading = true;
      const response = await fetch(`${config.apiUrl}/public/chatbot/${config.chatbotId}`);
      if (!response.ok) throw new Error('Failed to load chatbot');
      
      chatbot = await response.json();
      
      document.getElementById('botsmith-header-title').textContent = chatbot.name || 'Chat Support';
      
      if (chatbot.primary_color) {
        currentTheme.primary = chatbot.primary_color;
        currentTheme.secondary = chatbot.secondary_color || chatbot.primary_color;
        
        bubble.style.background = `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 50%, ${currentTheme.accent || currentTheme.secondary} 100%)`;
        header.style.background = `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 60%, ${currentTheme.accent || currentTheme.secondary} 100%)`;
        
        const sendBtn = document.getElementById('botsmith-send');
        if (sendBtn) sendBtn.style.background = `linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%)`;
        
        updateBotAvatarColors();
        
        const brandingBotSmith = brandingFooter.querySelector('span[style*="font-weight: 700"]');
        if (brandingBotSmith) brandingBotSmith.style.color = currentTheme.primary;
      }
      
      if (chatbot.accent_color) {
        customization.accent_color = chatbot.accent_color;
        const sendBtn = document.getElementById('botsmith-send');
        if (sendBtn) sendBtn.style.background = `linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%)`;
        updateBotAvatarColors();
      }
      if (chatbot.font_family) {
        customization.font_family = chatbot.font_family;
        updateContainerStyle();
      }
      if (chatbot.font_size) customization.font_size = chatbot.font_size;
      if (chatbot.bubble_style) customization.bubble_style = chatbot.bubble_style;
      
      if (messages.length > 0) renderMessages();
      
      if (chatbot.logo_url) {
        const flexContainer = header.querySelector('div[style*="display: flex"]');
        const logoContainer = flexContainer?.querySelector('div');
        if (logoContainer) {
          logoContainer.style.cssText = 'width: 48px; height: 48px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
          logoContainer.innerHTML = `<img src="${chatbot.logo_url}" alt="Logo" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
      }
      
      if (chatbot.widget_position) {
        const newPosition = positions[chatbot.widget_position] || positions['bottom-right'];
        container.style.bottom = '';
        container.style.top = '';
        container.style.left = '';
        container.style.right = '';
        
        if (newPosition.bottom) container.style.bottom = newPosition.bottom;
        if (newPosition.top) container.style.top = newPosition.top;
        if (newPosition.left) container.style.left = newPosition.left;
        if (newPosition.right) container.style.right = newPosition.right;
        
        const windowPosition = chatbot.widget_position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;';
        const windowAlign = chatbot.widget_position.includes('right') ? 'right: 0;' : 'left: 0;';
        
        chatWindow.style.cssText = `
          position: fixed; ${windowPosition} ${windowAlign}
          width: ${chatWindow.style.width || '420px'}; height: ${chatWindow.style.height || '600px'}; 
          max-width: calc(100vw - 40px); max-height: calc(100vh - 120px);
          background: white; border-radius: 24px; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.18), 0 10px 30px rgba(0, 0, 0, 0.1);
          display: ${chatWindow.style.display || 'none'}; flex-direction: column; overflow: hidden; 
          animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        `;
      }
      
      if (chatbot.widget_size) {
        const sizes = {
          'small': { width: '360px', height: '550px' },
          'medium': { width: '420px', height: '600px' },
          'large': { width: '500px', height: '700px' }
        };
        const size = sizes[chatbot.widget_size] || sizes['medium'];
        chatWindow.style.width = size.width;
        chatWindow.style.height = size.height;
      }
      
      if (chatbot.widget_theme) {
        const themeColors = {
          'light': 'linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%)',
          'dark': 'linear-gradient(to bottom, #1f2937 0%, #111827 100%)',
          'auto': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'linear-gradient(to bottom, #1f2937 0%, #111827 100%)' : 'linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%)'
        };
        messagesContainer.style.background = themeColors[chatbot.widget_theme] || themeColors['light'];
      }
      
      if (chatbot.auto_expand && !isOpen) {
        setTimeout(() => toggleChat(), 1000);
      }
      
      updateBrandingFooter();
      
      if (chatbot.welcome_message) {
        addMessage('assistant', chatbot.welcome_message);
      }
    } catch (error) {
      console.error('Error loading chatbot:', error);
      addMessage('assistant', 'Hello! How can I help you today?');
    } finally {
      isLoading = false;
    }
  }
  
  function updateBotAvatarColors() {
    const avatars = messagesContainer.querySelectorAll('div[style*="background"]');
    avatars.forEach(avatar => {
      if (avatar.querySelector('svg')) {
        avatar.style.background = `linear-gradient(135deg, ${customization.accent_color} 0%, ${customization.accent_color}dd 100%)`;
      }
    });
  }

  function updateBrandingFooter() {
    if (!chatbot) return;
    
    if (chatbot.powered_by_text === '' || chatbot.powered_by_text === null) {
      brandingFooter.style.display = 'none';
    } else {
      brandingFooter.style.display = 'block';
      const brandText = chatbot.powered_by_text || 'BotSmith';
      
      brandingFooter.innerHTML = `
        <a href="https://botsmith.io" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #9ca3af; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.3s; font-weight: 500;">
          <span>Powered by</span>
          <span style="font-weight: 700; color: ${currentTheme.primary}; letter-spacing: 0.3px;">${brandText}</span>
        </a>
      `;
      
      const brandingLink = brandingFooter.querySelector('a');
      if (brandingLink) {
        brandingLink.addEventListener('mouseenter', () => {
          brandingLink.style.color = currentTheme.primary;
          brandingLink.style.transform = 'translateY(-1px)';
        });
        brandingLink.addEventListener('mouseleave', () => {
          brandingLink.style.color = '#9ca3af';
          brandingLink.style.transform = 'translateY(0)';
        });
      }
    }
  }

  async function sendMessage(message) {
    if (!message.trim() || isSending) return;
    
    isSending = true;
    const input = document.getElementById('botsmith-input');
    input.disabled = true;
    
    addMessage('user', message);
    input.value = '';
    
    showTyping();
    
    try {
      const response = await fetch(`${config.apiUrl}/public/chat/${config.chatbotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      hideTyping();
      addMessage('assistant', data.message);
    } catch (error) {
      console.error('Error sending message:', error);
      hideTyping();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      isSending = false;
      input.disabled = false;
      input.focus();
    }
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.style.display = 'flex';
      bubble.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
      bubble.className = '';
      document.getElementById('botsmith-input').focus();
      
      if (!chatbot) loadChatbot();
    } else {
      chatWindow.style.display = 'none';
      bubble.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white"/>
        </svg>
      `;
      bubble.className = 'botsmith-bubble';
    }
  }

  // Event listeners
  bubble.onclick = toggleChat;
  document.getElementById('botsmith-close').onclick = (e) => {
    e.stopPropagation();
    toggleChat();
  };
  
  document.getElementById('botsmith-form').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('botsmith-input');
    sendMessage(input.value);
  };

  // API
  window.BotSmith = {
    open: () => { if (!isOpen) toggleChat(); },
    close: () => { if (isOpen) toggleChat(); },
    toggle: toggleChat,
    isOpen: () => isOpen
  };
  
  loadChatbot();
})();
