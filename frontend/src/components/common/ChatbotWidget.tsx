import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axios';
import { 
  MessageSquare, X, Send, Loader2, Sparkles, 
  ChevronRight, CornerDownRight, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'BOT';
  text: string;
  products?: any[];
  orders?: any[];
  suggestions?: string[];
  timestamp: Date;
}

export const ChatbotWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'BOT',
      text: `Welcome! I am your <b>ShopSphere AI Assistant</b>.<br/>I can help you track your recent orders, recommend premium items, or search for laptops within a budget.<br/><br/>How can I help you today?`,
      suggestions: [
        'Where is my order?',
        'Suggest laptops under ₹50000',
        'Recommend premium products',
        'What are today\'s offers?'
      ],
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsgId = 'user_' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'USER',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/message', {
        message: textToSend,
        customerId: isAuthenticated ? user?.id : null
      });

      const { reply, products, orders, suggestions } = response.data.data;

      const botMsgId = 'bot_' + Date.now();
      const newBotMsg: ChatMessage = {
        id: botMsgId,
        sender: 'BOT',
        text: reply,
        products: products || [],
        orders: orders || [],
        suggestions: suggestions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error('Chatbot error', error);
      const botMsgId = 'bot_err_' + Date.now();
      setMessages(prev => [...prev, {
        id: botMsgId,
        sender: 'BOT',
        text: 'Sorry, I encountered an error. Please try again in a few moments.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'BOT',
        text: `Welcome back! I am your <b>ShopSphere AI Assistant</b>.<br/>How can I help you today?`,
        suggestions: [
          'Where is my order?',
          'Suggest laptops under ₹50000',
          'Recommend premium products',
          'What are today\'s offers?'
        ],
        timestamp: new Date()
      }
    ]);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowNotificationBadge(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Dialogue Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[360px] sm:w-[400px] h-[550px] bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden mb-4 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                  <Sparkles size={18} className="text-white animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                    <span>ShopSphere Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                  </div>
                  <div className="text-[10px] text-slate-400">Personalised shopping guide</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={handleClearChat}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Clear Chat Logs"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={handleToggle}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'USER'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none'
                      }`}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  </div>

                  {/* Render Orders Card */}
                  {msg.orders && msg.orders.length > 0 && (
                    <div className="flex justify-start pl-2">
                      <div className="w-[85%] bg-white border border-slate-150 rounded-2xl p-3 shadow-xs space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 text-[10px] font-bold text-slate-400">
                          <span>ORDER STATUS</span>
                          <span className="text-blue-600">#ORD-{msg.orders[0].id}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Status:</span>
                            <span className="text-blue-600 uppercase text-[10px]">{msg.orders[0].orderStatus}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 leading-normal">
                            <div>Courier: <b>{msg.orders[0].courierPartner || 'Delhivery'}</b></div>
                            <div>Tracking ID: <code>{msg.orders[0].trackingId || 'N/A'}</code></div>
                            {msg.orders[0].expectedDeliveryDate && (
                              <div className="mt-1 font-semibold text-slate-700">
                                Expected: {new Date(msg.orders[0].expectedDeliveryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/orders');
                          }}
                          className="w-full text-center py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-700 rounded-lg transition-all"
                        >
                          View Delivery Progress Timeline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Products recommended */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex justify-start pl-2 overflow-x-auto gap-2.5 py-1">
                      {msg.products.map((p) => (
                        <div 
                          key={p.id} 
                          className="w-48 bg-white border border-slate-150 rounded-2xl p-2.5 flex-shrink-0 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                        >
                          <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-50 mb-2 border border-slate-100">
                            <img 
                              src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'} 
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">{p.name}</h4>
                            <span className="text-[9px] text-slate-400 font-medium block">{p.brand}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-[11px] font-extrabold text-slate-800">₹{p.price.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/products/${p.id}`);
                              }}
                              className="p-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-slate-500 transition-all"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Suggestion Chips inside the bot message */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-2 pt-1">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSendMessage(s)}
                          className="px-2.5 py-1 bg-slate-200/50 hover:bg-blue-50 border border-slate-300/40 text-[10px] text-slate-650 font-bold rounded-full transition-all text-left flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight size={10} className="text-slate-400" />
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Bot typing loading block */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400">AI Assistant is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 border-t border-slate-150 flex gap-2 items-center flex-shrink-0 bg-white"
            >
              <input
                type="text"
                placeholder="Ask me to track orders, search laptops..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/10 cursor-pointer relative hover:bg-slate-800 transition-all border border-slate-800"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare size={24} />
              {showNotificationBadge && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full animate-bounce" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
