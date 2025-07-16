// API utility functions for the chat interface

const API_BASE_URL = 'http://127.0.0.1:8000' // FastAPI backend on port 8000

export const sendMessage = async (message, file = null) => {
  try {
    console.log('Sending message:', message, 'File:', file?.name)
    let response

    if (file) {
      // If there's a file, upload it first, then ask question
      console.log('Uploading file to:', `${API_BASE_URL}/upload`)
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: uploadFormData,
      })

      console.log('Upload response status:', uploadResponse.status)
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('Upload error response:', errorText)
        throw new Error(`Upload failed! status: ${uploadResponse.status}, response: ${errorText}`)
      }

      const uploadData = await uploadResponse.json()
      console.log('File uploaded successfully:', uploadData)

      // Now send the question with the uploaded file context
      console.log('Sending question to:', `${API_BASE_URL}/ask`)
      const askFormData = new FormData()
      askFormData.append('question', message)
      // You might need to pass file_id or filename depending on your API
      if (uploadData.file_id) {
        askFormData.append('file_id', uploadData.file_id)
      } else if (uploadData.filename) {
        askFormData.append('filename', uploadData.filename)
      }

      response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        body: askFormData,
      })
    } else {
      // Just send the question without file
      console.log('Sending question to:', `${API_BASE_URL}/ask`)
      
      // Your FastAPI expects FormData with 'question' field
      const askFormData = new FormData()
      askFormData.append('question', message)

      response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        body: askFormData,
      })
    }

    console.log('Ask response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ask error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
    }

    const data = await response.json()
    console.log('API response data:', data)
    
    return {
      success: true,
      response: data.context || data.answer || data.response || data.message || data.text || JSON.stringify(data),
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('API Error details:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    throw error
  }
}

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('=== API CONNECTION TEST START ===')
    console.log('Testing API connection to:', API_BASE_URL)
    
    // Test 1: Basic connection to root
    try {
      const rootResponse = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
      })
      console.log('Root endpoint status:', rootResponse.status)
      if (rootResponse.ok) {
        const rootData = await rootResponse.json()
        console.log('Root endpoint response:', rootData)
      }
    } catch (rootError) {
      console.log('Root endpoint failed:', rootError.message)
    }
    
    // Test 2: Docs endpoint (optional)
    try {
      const docsResponse = await fetch(`${API_BASE_URL}/docs`, {
        method: 'GET',
      })
      console.log('Docs endpoint status:', docsResponse.status)
    } catch (docsError) {
      console.log('Docs endpoint failed (this is normal if not configured):', docsError.message)
    }
    
    // Test 4: POST to /ask endpoint
    try {
      console.log('Testing POST to /ask with FormData...')
      const askFormData = new FormData()
      askFormData.append('question', 'test')
      
      const testResponse = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        body: askFormData,
      })
      console.log('Ask endpoint status:', testResponse.status)
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.log('Ask endpoint error response:', errorText)
      } else {
        const data = await testResponse.json()
        console.log('Ask endpoint success response:', data)
      }
    } catch (askError) {
      console.log('Ask endpoint failed:', askError.message)
    }
    
    console.log('=== API CONNECTION TEST END ===')
    
    // Return true if at least one endpoint responds
    return true
  } catch (error) {
    console.error('API connection test completely failed:', error)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    return false
  }
}

// Manual test function - can be called from browser console
export const manualTest = async () => {
  console.log('🔍 Manual API Test Starting...')
  
  // Test 1: Simple fetch to see if server is reachable
  try {
    const response = await fetch('http://127.0.0.1:8000/')
    console.log('✅ Server is reachable, status:', response.status)
    if (response.ok) {
      const data = await response.json()
      console.log('📄 Root response:', data)
    }
  } catch (error) {
    console.log('❌ Server not reachable:', error.message)
    console.log('💡 Make sure your FastAPI server is running on port 8000')
    return
  }
  
  // Test 2: Check if /ask endpoint exists with FormData (as your API expects)
  try {
    const formData = new FormData()
    formData.append('question', 'hello')
    
    const response = await fetch('http://127.0.0.1:8000/ask', {
      method: 'POST',
      body: formData
    })
    console.log('✅ /ask endpoint responds, status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📄 Response data:', data)
    } else {
      const error = await response.text()
      console.log('⚠️ /ask endpoint error:', error)
    }
  } catch (error) {
    console.log('❌ /ask endpoint failed:', error.message)
  }
  
  console.log('🔍 Manual API Test Complete!')
}

// Example API response structure (for testing)
export const mockApiCall = async (message, file = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock response
  return {
    success: true,
    response: `This is a sample response to: "${message}"${file ? `\n\nFile uploaded: ${file.name}` : ''}`,
    timestamp: new Date().toISOString()
  }
} 

// Fetch list of uploaded PDFs
export const fetchUploadedFiles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'GET',
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status}`)
    }
    const data = await response.json()
    return data.uploaded_files || []
  } catch (error) {
    console.error('Error fetching uploaded files:', error)
    return []
  }
} 