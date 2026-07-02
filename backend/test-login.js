const axios = require('axios')

const testLogin = async () => {
  try {
    console.log('🔍 Testing login...')
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'jusjus',
      password: 'kacci123'
    })
    
    console.log('\n✅ Login SUCCESSFUL!')
    console.log('📝 User Data:', response.data)
  } catch (error) {
    console.error('\n❌ Login FAILED!')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Message:', error.response.data.message || error.response.data)
    } else {
      console.error('Error:', error.message)
      console.error('\n⚠️ Make sure the backend is running on port 5000!')
    }
  }
}

testLogin()
