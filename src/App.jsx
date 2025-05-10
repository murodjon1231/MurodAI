import React, { useState, useEffect, useRef } from "react";
import logo from "/logo.png";
const App = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState({ title: "", messages: [] });
  const [darkMode, setDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChatNameModal, setShowChatNameModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [aiModels, setAiModels] = useState([
    {
      id: 1,
      name: "MurodAI",
      icon: "🧠",
      description: "Men O'zbek tilidagi AI yordamchiman. Sizga har qanday mavzuda yordam berishim mumkin. Savol va topshiriqlaringizni yozing, men javob beraman!"
    },
    {
      id: 2,
      name: "KoderAI",
      icon: "💻",
      description: "Frontend dasturlash bo'yicha mutaxassis. HTML, CSS, JavaScript, React va boshqa frontend texnologiyalarda kod yozishga yordam beraman."
    },
    {
      id: 3,
      name: "BackendAI",
      icon: "⚙️",
      description: "Backend dasturlash bo'yicha mutaxassis. Node.js, Python, Java, PHP va ma'lumotlar bazalari bilan ishlashga yordam beraman."
    },
    {
      id: 4,
      name: "RasmAI",
      icon: "🎨",
      description: "Tavsif asosida rasmlar yaratishga yordam beruvchi sun'iy intellekt. Rasmlar yaratish uchun tavsifni kiriting."
    },
    {
      id: 5,
      name: "OqilAI",
      icon: "🧠",
      description: "Men dunyoning eng zor gamer AI yordamchiman. Sizga har qanday o'yin haqida maslahatlar beraman, strategiyalar ishlab chiqaman va o'yinlarni yanada qiziqarli qilish uchun yordam beraman!"
    }
  ]);
  const [activeAI, setActiveAI] = useState(null);
  const [showAISelector, setShowAISelector] = useState(false);
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }

    setActiveAI(aiModels[0]);

    if (!savedSessions || JSON.parse(savedSessions).length === 0) {
      createNewChat();
    } else {
      const sessions = JSON.parse(savedSessions);
      setCurrentChatId(sessions[0].id);
      setCurrentChat(sessions[0]);
    }
  }, []);

  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat.messages]);

  const createNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: "Yangi suhbat",
      messages: [],
      timestamp: new Date().toISOString(),
      aiModelId: activeAI?.id || 1
    };

    setChatSessions(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setCurrentChat(newChat);
    setResponse("");
    setPrompt("");
    removeImage();
    setGeneratedImage(null);
  };

  const switchChat = (chatId) => {
    const chat = chatSessions.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setCurrentChat(chat);
      setResponse("");
      setPrompt("");
      removeImage();
      setGeneratedImage(null);

      const chatAiModel = aiModels.find(ai => ai.id === chat.aiModelId) || aiModels[0];
      setActiveAI(chatAiModel);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));

    if (chatId === currentChatId) {
      const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        switchChat(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const renameChat = () => {
    if (newChatName.trim()) {
      setChatSessions(prev =>
        prev.map(chat =>
          chat.id === currentChatId ? { ...chat, title: newChatName } : chat
        )
      );
      setCurrentChat(prev => ({ ...prev, title: newChatName }));
      setShowChatNameModal(false);
      setNewChatName("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const switchAiModel = (model) => {
    setActiveAI(model);
    setShowAISelector(false);

    if (currentChatId) {
      setChatSessions(prev =>
        prev.map(chat =>
          chat.id === currentChatId ? { ...chat, aiModelId: model.id } : chat
        )
      );
      setCurrentChat(prev => ({ ...prev, aiModelId: model.id }));
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setIsGeneratingImage(true);
    setError("");

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const placeholderImage = `https://picsum.photos/seed/${Date.now()}/800/600`;
      setGeneratedImage(placeholderImage);

      const userMessage = {
        role: "user",
        content: prompt,
        timestamp: new Date().toISOString(),
      };

      const aiMessage = {
        role: "assistant",
        content: "Mana sizning so'rovingiz bo'yicha yaratilgan rasm:",
        timestamp: new Date().toISOString(),
        hasGeneratedImage: true,
        generatedImageUrl: placeholderImage
      };

      const updatedMessages = [...currentChat.messages, userMessage, aiMessage];

      setCurrentChat(prev => ({
        ...prev,
        messages: updatedMessages,
        title: prev.title === "Yangi suhbat" && prompt.trim() ? prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "") : prev.title
      }));

      setChatSessions(prev =>
        prev.map(chat =>
          chat.id === currentChatId ?
            { ...chat, messages: updatedMessages, timestamp: new Date().toISOString() } :
            chat
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );

      setPrompt("");
    } catch (error) {
      setError("Rasm yaratishda xatolik: " + error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !selectedImage) return;

    if (activeAI.id === 4) {
      generateImage();
      return;
    }

    setLoading(true);
    setError("");

    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
      hasImage: !!selectedImage,
      imageName: selectedImage?.name || null,
    };

    const updatedMessages = [...currentChat.messages, userMessage];
    setCurrentChat(prev => ({
      ...prev,
      messages: updatedMessages,
      title: prev.title === "Yangi suhbat" && prompt.trim() ? prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "") : prev.title
    }));

    setPrompt("");

    try {
      let promptPrefix = "";
      if (activeAI.id === 2) {
        promptPrefix = "Sen frontend dasturlash bo'yicha mutaxassissan. Faqat toza, optimallashtirilgan va zamonaviy frontend kodi yozib ber. ";
      } else if (activeAI.id === 3) {
        promptPrefix = "Sen backend dasturlash bo'yicha mutaxassissan. Faqat ishonchli, xavfsiz va samarali backend kodi yozib ber. ";
      }else if (activeAI.id === 5) { 
        promptPrefix = "Sen gamer AI yordamchisan. O'yinlar haqida maslahatlar ber va strategiyalar ishlab chiq. ";
      }

      const imageNote = selectedImage ? `(Yuklangan rasm: ${selectedImage.name})` : "";
      const fullPrompt = promptPrefix + prompt + (imageNote ? ` ${imageNote}` : "");

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBBl6SUFYIdKBYu4m4kwfG3VIuYiPPTg2Y",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: fullPrompt }],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`API xatolik: ${res.status}`);
      }

      const data = await res.json();
      const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hech qanday javob yo'q.";

      const aiMessage = {
        role: "assistant",
        content: output,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];

      setCurrentChat(prev => ({
        ...prev,
        messages: finalMessages
      }));

      setChatSessions(prev =>
        prev.map(chat =>
          chat.id === currentChatId ?
            { ...chat, messages: finalMessages, timestamp: new Date().toISOString() } :
            chat
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );

      removeImage();
    } catch (error) {
      setError("Xatolik yuz berdi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const formatMessageContent = (content) => {
    let formattedContent = content;

    formattedContent = formattedContent.replace(
      /```(\w+)?\s*([\s\S]*?)```/g,
      (match, language, code) => {
        const escapeHtml = (text) => {
          return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        const highlightSyntax = (code, language) => {
          const escapedCode = escapeHtml(code);

          if (!language) return escapedCode;

          let highlighted = escapedCode;

          const keywords = [
            "function", "const", "let", "var", "return", "if", "else", "for", "while",
            "class", "import", "export", "from", "true", "false", "null", "undefined",
            "async", "await", "try", "catch", "new"
          ];

          keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
          });

          highlighted = highlighted.replace(
            /(["'])(.*?)\1/g,
            '<span class="string">$&</span>'
          );

          highlighted = highlighted.replace(
            /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm,
            '<span class="comment">$&</span>'
          );

          highlighted = highlighted.replace(
            /\b(\d+)\b/g,
            '<span class="number">$&</span>'
          );

          return highlighted;
        };

        const languageName = language || 'code';
        const highlightedCode = highlightSyntax(code, language);

        return `<div class="code-block ${darkMode ? 'dark' : 'light'}">
                  <div class="code-header">
                    <span>${languageName}</span>
                    <button class="copy-btn" onclick="copyToClipboard(this, \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                      Nusxa olish
                    </button>
                  </div>
                  <pre><code>${highlightedCode}</code></pre>
                </div>`;
      }
    );

    const importantWords = [
      { word: "muhim", class: "highlight-important" },
      { word: "e'tibor", class: "highlight-important" },
      { word: "xatolik", class: "highlight-error" },
      { word: "to'g'ri", class: "highlight-success" },
      { word: "noto'g'ri", class: "highlight-error" }
    ];

    importantWords.forEach(item => {
      const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
      formattedContent = formattedContent.replace(regex, `<span class="${item.class}">$&</span>`);
    });

    formattedContent = formattedContent.replace(/\n/g, '<br>');

    return formattedContent;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"} transition-colors duration-300 flex`}>
      {showChatNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-lg max-w-md w-full`}>
            <h3 className="text-lg font-medium mb-4">Suhbat nomini o'zgartirish</h3>
            <input
              type="text"
              className={`w-full p-2 mb-4 rounded border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                }`}
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Yangi nom"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowChatNameModal(false)}
                className={`px-4 py-2 rounded ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={renameChat}
                className={`px-4 py-2 rounded text-white ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {showAISelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAISelector(false)}>
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-lg max-w-md w-full`} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">AI modelni tanlang</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {aiModels.map(model => (
                <div
                  key={model.id}
                  onClick={() => switchAiModel(model)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${model.id === activeAI.id
                      ? darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                >
                  <span className="text-2xl">{model.icon}</span>
                  <div>
                    <h4 className="font-medium">{model.name}</h4>
                    <p className={`text-sm ${model.id === activeAI.id ? "text-gray-100" : darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {model.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`${sidebarOpen ? "w-72" : "w-0"} ${darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg transition-all duration-300 fixed h-full overflow-hidden z-10`}
      >
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                MurodAI Chat
              </h2>
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                aria-label="Close Sidebar"
              >
                ←
              </button>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={createNewChat}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              <span>➕</span>
              <span>Yangi suhbat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {chatSessions.length === 0 ? (
              <div className={`text-sm text-center py-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>Suhbatlar yo'q</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chatSessions.map((chat) => {
                  const chatAi = aiModels.find(ai => ai.id === chat.aiModelId) || aiModels[0];
                  return (
                    <div
                      key={chat.id}
                      onClick={() => switchChat(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${chat.id === currentChatId
                          ? darkMode
                            ? "bg-gray-700 text-blue-400"
                            : "bg-blue-50 text-blue-700"
                          : darkMode
                            ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                            : "bg-white hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span>{chatAi.icon}</span>
                        <span className="truncate">{chat.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewChatName(chat.title);
                            setShowChatNameModal(true);
                          }}
                          className={`p-1 rounded ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                            }`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className={`p-1 rounded ${darkMode ? "hover:bg-gray-600 text-red-400" : "hover:bg-gray-200 text-red-500"
                            }`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-0"}`}>
        <div className="p-4 max-w-4xl mx-auto">
          <header className={`flex justify-between items-center mb-6 p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-full ${darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                aria-label="Toggle Sidebar"
              >
                {sidebarOpen ? "☰" : "☰"}
              </button>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowAISelector(true)}
              >
                <span className="text-2xl mr-2">{activeAI?.icon}</span>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                  {activeAI?.name}
                </h1>
                <span className="ml-2 text-lg">▼</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                aria-label={darkMode ? "Yorug' mode" : "Qorong'i mode"}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </header>

          <div className={`mb-8 rounded-xl shadow-md ${darkMode ? "bg-gray-800" : "bg-white"} overflow-y-auto`} style={{ maxHeight: "calc(100vh - 230px)" }}>
            <div className="p-4">
              {currentChat.messages.length === 0 ? (
                <div className={`p-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="text-5xl mb-4">{activeAI?.icon}</div>
                  <h3 className="text-xl font-medium mb-3">{activeAI?.name}</h3>
                  <p className="mb-6 max-w-md mx-auto">{activeAI?.description}</p>

                  <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                    {activeAI?.id === 4 ?
                      ["Qizil gul rasmi", "Tog' manzarasi", "O'zbek milliy taomi"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setPrompt(suggestion);
                            setTimeout(() => handleSubmit(), 100);
                          }}
                          className={`p-3 rounded-lg text-left ${darkMode
                              ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                              : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                            }`}
                        >
                          {suggestion}
                        </button>
                      ))
                      : activeAI?.id === 2 ?
                        ["Yangi React komponenti yarating", "CSS animatsiya qanday qilinadi?", "Responsive dizayn bo'yicha maslahat bering"].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setPrompt(suggestion);
                              setTimeout(() => handleSubmit(), 100);
                            }}
                            className={`p-3 rounded-lg text-left ${darkMode
                                ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                                : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                              }`}
                          >
                            {suggestion}
                          </button>
                        ))
                        : activeAI?.id === 3 ?
                          ["Node.js server yarating", "SQL so'rovlar haqida", "Ma'lumotlar bazasi dizayni"].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setPrompt(suggestion);
                                setTimeout(() => handleSubmit(), 100);
                              }}
                              className={`p-3 rounded-lg text-left ${darkMode
                                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                                  : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                                }`}
                            >
                              {suggestion}
                            </button>
                          )): activeAI?.id === 5 ?
                          ["Fifa xaqida maluot", "Brawl stars haqida malumot", "Qanqa qilib oyinlarda tez pul yegish"].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setPrompt(suggestion);
                                setTimeout(() => handleSubmit(), 100);
                              }}
                              className={`p-3 rounded-lg text-left ${darkMode
                                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                                  : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                                }`}
                            >
                              {suggestion}
                            </button>
                          ))
                          : ["Algoritm nima?", "O'zbek tilida she'r yozing", "Python dasturlash tilini o'rgatib bering"].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setPrompt(suggestion);
                                setTimeout(() => handleSubmit(), 100);
                              }}
                              className={`p-3 rounded-lg text-left ${darkMode
                                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                                  : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                                }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentChat.messages.map((message, index) => (
                    <div key={index} className={`${message.role === "user" ? "flex flex-row-reverse" : "flex"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${message.role === "user"
                            ? darkMode
                              ? "bg-blue-600 text-white"
                              : "bg-blue-500 text-white"
                            : darkMode
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {message.role === "assistant" ? (
                          <>
                            <div
                              className="message-content"
                              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                            />
                            {message.hasGeneratedImage && (
                              <div className="mt-4 flex justify-center">
                                <img
                                  src={message.generatedImageUrl}
                                  alt="Generated image"
                                  className="rounded-lg max-w-full max-h-96 border-2 border-gray-500"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>{message.content}</div>
                            {message.hasImage && (
                              <div className="mt-2 text-sm opacity-75">
                                🖼️ Rasm: {message.imageName}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              {imagePreview && (
                <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Tanlangan rasm: {selectedImage.name}
                    </p>
                    <button
                      type="button"
                      onClick={removeImage}
                      className={`px-3 py-1 rounded text-xs ${darkMode
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      Rasmni o'chirish
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative max-w-xs">
                      <img src={imagePreview} alt="Preview" className="object-contain rounded-lg max-h-48 border" />
                    </div>
                  </div>
                </div>
              )}

              {generatedImage && !imagePreview && activeAI?.id === 4 && (
                <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Yaratilgan rasm
                    </p>
                    <button
                      type="button"
                      onClick={() => setGeneratedImage(null)}
                      className={`px-3 py-1 rounded text-xs ${darkMode
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      Yaratilgan rasmni o'chirish
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative max-w-md">
                      <img src={generatedImage} alt="Generated" className="object-contain rounded-lg max-h-64 border" />
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = generatedImage;
                          link.download = 'murodai-rasm.jpg';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className={`absolute bottom-2 right-2 px-3 py-1 rounded text-sm ${darkMode
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                      >
                        Yuklab olish
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <textarea
                  className={`w-full p-4 resize-none focus:outline-none ${darkMode
                      ? "bg-gray-800 text-white placeholder-gray-500"
                      : "bg-white text-gray-800 placeholder-gray-400"
                    }`}
                  rows="3"
                  placeholder={activeAI?.id === 4 ? "Yaratmoqchi bo'lgan rasm tavsifini yozing..." : "Xabaringizni yozing..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                ></textarea>
                {prompt && (
                  <button
                    type="button"
                    className={`absolute top-2 right-2 p-1 rounded-full ${darkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                      }`}
                    onClick={() => setPrompt("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className={`flex items-center p-2 border-t ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
                {activeAI?.id !== 4 && (
                  <label
                    htmlFor="image-upload"
                    className={`p-2 rounded-full cursor-pointer transition-colors mr-2 ${darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-200 text-gray-600"
                      }`}
                  >
                    🖼️
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="flex-1 text-right">
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-full transition-colors text-white font-medium ${loading || isGeneratingImage
                        ? "bg-gray-500 cursor-not-allowed"
                        : !prompt.trim() && !selectedImage
                          ? darkMode
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : darkMode
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    disabled={loading || isGeneratingImage || (!prompt.trim() && !selectedImage)}
                  >
                    {loading ? "Yuborilmoqda..." :
                      isGeneratingImage ? "Rasm yaratilmoqda..." :
                        activeAI?.id === 4 ? "Rasm yaratish" : "Yuborish"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <style dangerouslySetInnerHTML={{
            __html: `
            .code-block {
              margin: 12px 0;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .code-block.dark {
              background: #1e1e2d;
              border: 1px solid #3a3a4a;
            }
            .code-block.light {
              background: #f5f7fa;
              border: 1px solid #e0e5ec;
            }
            .code-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 15px;
              font-family: monospace;
              font-weight: bold;
            }
            .code-block.dark .code-header {
              background: #2d2d3d;
              color: #e0e0ee;
            }
            .code-block.light .code-header {
              background: #e2e8f0;
              color: #333;
            }
            .copy-btn {
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            }
            .code-block.dark .copy-btn {
              background: #4a5568;
              color: #fff;
            }
            .code-block.light .copy-btn {
              background: #cbd5e0;
              color: #333;
            }
            .code-block.dark .copy-btn:hover {
              background: #718096;
            }
            .code-block.light .copy-btn:hover {
              background: #a0aec0;
            }
            .code-block pre {
              margin: 0;
              padding: 15px;
              overflow-x: auto;
              font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
              font-size: 14px;
              line-height: 1.5;
            }
            .code-block.dark pre {
              color: #e2e8f0;
            }
            .code-block.light pre {
              color: #2d3748;
            }

            /* Syntax highlighting */
            .keyword {
              color: #8b5cf6;
              font-weight: bold;
            }
            .string {
              color: #10b981;
            }
            .comment {
              color: #94a3b8;
              font-style: italic;
            }
            .number {
              color: #f59e0b;
            }

            /* Important text highlighting */
            .highlight-important {
              color: #f97316;
              font-weight: bold;
            }
            .highlight-error {
              color: #ef4444;
              font-weight: bold;
            }
            .highlight-success {
              color: #10b981;
              font-weight: bold;
            }

            /* Fix copy button functionality */
            @keyframes copySuccess {
              0% { background-color: #10b981; }
              100% { background-color: #4a5568; }
            }

            @keyframes copySuccessLight {
              0% { background-color: #10b981; }
              100% { background-color: #cbd5e0; }
            }

            .copy-success.dark {
              animation: copySuccess 1s ease;
            }

            .copy-success.light {
              animation: copySuccessLight 1s ease;
            }
          `}} />

          <script dangerouslySetInnerHTML={{
            __html: `
            function copyToClipboard(button, text) {
              navigator.clipboard.writeText(text).then(function() {
                const isDark = document.body.classList.contains('dark') || 
                             window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

                // Change button text
                const originalText = button.innerText;
                button.innerText = "Nusxalandi!";

                // Add animation class
                button.classList.add(isDark ? "copy-success dark" : "copy-success light");

                // Reset after a while
                setTimeout(() => {
                  button.innerText = originalText;
                  button.classList.remove("copy-success");
                }, 2000);
              }).catch(function(error) {
                console.error('Nusxa olishda xatolik:', error);
                button.innerText = "Xatolik!";
                setTimeout(() => {
                  button.innerText = "Nusxa olish";
                }, 2000);
              });
            }
          `}} />
        </div>
      </div>
    </div>
  );
}
export default App;