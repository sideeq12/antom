import { useState, useRef, useEffect } from 'react'
import './App.css'
import { sendMessage, mockApiCall, testApiConnection, fetchUploadedFiles } from './utils/api.js'

function App() {
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [pdfList, setPdfList] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false) // NEW: sidebar toggle for mobile
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch PDF list on mount
  useEffect(() => {
    fetchFiles()
  }, [])

  // Helper to fetch files
  const fetchFiles = async () => {
    const files = await fetchUploadedFiles()
    setPdfList(files)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedFile) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      file: uploadedFile
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setUploadedFile(null)
    setIsLoading(true)

    // FastAPI backend integration
    try {
      // Use real API with FastAPI backend
      const response = await sendMessage(inputMessage, uploadedFile)
      // const response = await mockApiCall(inputMessage, uploadedFile) // Uncomment for testing
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response,
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    const allPDFs = files.every(file => file.type === 'application/pdf')
    if (!allPDFs) {
      alert('Please upload only PDF files')
      return
    }
    setIsLoading(true)
    try {
      // Upload all files as 'files' field
      const uploadFormData = new FormData()
      files.forEach(file => uploadFormData.append('files', file))
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: uploadFormData,
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed! status: ${response.status}, response: ${errorText}`)
      }
      const data = await response.json()
      // Show backend message in chat
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.message || 'Files uploaded successfully.',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages(prev => [...prev, botMessage])
      await fetchFiles() // Refresh PDF list after upload
    } catch (error) {
      console.error('File upload error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error uploading your file(s).',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const testConnection = async () => {
    const isConnected = await testApiConnection()
    if (isConnected) {
      alert('✅ API connection successful!')
    } else {
      alert('❌ API connection failed! Check console for details.')
    }
  }

  if (!showChat) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 p-8">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Antom</h1>
          <p className="text-2xl md:text-3xl max-w-2xl text-center mb-8">Your AI-powered PDF Q&A Assistant</p>
          <button onClick={() => setShowChat(true)} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold transition-colors shadow-lg">Get Started</button>
        </section>
        {/* Features Section */}
        <section className="max-w-5xl mx-auto py-20 px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Instant PDF Upload</h3>
              <p>Upload your PDFs and get them processed instantly for Q&A.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Contextual Answers</h3>
              <p>Ask questions and receive detailed, context-rich answers from your documents.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">File Management</h3>
              <p>See all your uploaded PDFs in one place and switch between them easily.</p>
            </div>
          </div>
        </section>
        {/* How it Works Section */}
        <section className="bg-gray-800 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
            <ol className="list-decimal list-inside space-y-4 text-lg">
              <li>Upload your PDF document.</li>
              <li>Ask any question related to the content.</li>
              <li>Get instant, accurate answers with context.</li>
              <li>Manage and revisit your uploaded files anytime.</li>
            </ol>
          </div>
        </section>
        {/* Use Cases Section */}
        <section className="max-w-5xl mx-auto py-20 px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Students & Researchers</h3>
              <p>Quickly extract information from academic papers, textbooks, and research PDFs.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Professionals</h3>
              <p>Find answers in manuals, reports, and business documents without reading everything.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Legal & Compliance</h3>
              <p>Search through contracts, policies, and legal PDFs for specific clauses and information.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Anyone with PDFs!</h3>
              <p>Antom is for anyone who wants to get more from their documents, fast.</p>
            </div>
          </div>
        </section>
        {/* About Section */}
        <section className="bg-gray-900 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About Antom</h2>
            <p className="text-lg">Antom leverages state-of-the-art AI to help you interact with your documents in a whole new way. Built for speed, accuracy, and ease of use.</p>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="bg-gray-800 py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">Is my data secure?</h3>
                <p>All files are processed securely and never shared.</p>
              </div>
              <div>
                <h3 className="font-semibold">What file types are supported?</h3>
                <p>Currently, only PDF files are supported.</p>
              </div>
              <div>
                <h3 className="font-semibold">How fast are answers?</h3>
                <p>Most answers are generated in seconds, depending on document size.</p>
              </div>
            </div>
          </div>
        </section>
        {/* Get Started / Call to Action Section */}
        <section className="flex flex-col items-center justify-center py-20 bg-gradient-to-t from-blue-900 to-gray-900">
          <h2 className="text-4xl font-bold mb-6">Ready to get answers from your PDFs?</h2>
          <button onClick={() => setShowChat(true)} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-2xl font-semibold transition-colors shadow-lg">Start Chatting</button>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex flex-1 h-full">
        {/* Sidebar for PDF list */}
        {/* Mobile sidebar overlay */}
        <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />
        <aside className={`fixed z-50 top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0 transform transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}> 
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Uploaded PDFs</h2>
            {/* Close button for mobile */}
            <button className="md:hidden text-gray-400 hover:text-white text-2xl" onClick={() => setSidebarOpen(false)}>&times;</button>
          </div>
          {/* Upload Button in Sidebar */}
          <div className="mb-4 flex items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold flex items-center"
              title="Upload PDF(s)"
            >
              <span className="mr-2">📎</span> Upload PDF(s)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          {pdfList.length === 0 ? (
            <div className="text-gray-400 text-sm">No PDFs uploaded yet.</div>
          ) : (
            <ul className="space-y-2">
              {pdfList.map((filename, idx) => (
                <li key={filename || idx} className="truncate text-white bg-gray-700 rounded px-3 py-2 text-sm">
                  {filename}
                </li>
              ))}
            </ul>
          )}
        </aside>
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Sidebar toggle for mobile */}
                <button className="md:hidden text-white text-2xl mr-2" onClick={() => setSidebarOpen(true)}>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-7 h-7'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' /></svg>
                </button>
                <h1 className="text-xl font-bold text-white">Antom</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={testConnection}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Test API
                </button>
                <span className="text-gray-300 text-sm hidden sm:inline">Dark Mode</span>
              </div>
            </div>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 sm:mt-20">
                  <div className="text-6xl mb-4">🤖</div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome to Antom</h2>
                  <p className="text-lg">Ask me anything or upload a PDF to get started!</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.file && (
                      <div className="mb-2 p-2 bg-gray-600 rounded text-sm">
                        📎 {message.file.name}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">{message.timestamp}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-gray-800 border-t border-gray-700 p-2 sm:p-4">
            <div className="max-w-4xl mx-auto">
              {/* Message Input and Send Button in a flex row */}
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything or upload a PDF..."
                    className="w-full p-3 pr-12 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                    rows="1"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={(!inputMessage.trim() && !uploadedFile) || isLoading}
                  className="h-12 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                  style={{ minHeight: '44px' }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
