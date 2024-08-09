'use client'

import { Box, Button, Stack, TextField, Avatar, AppBar, Toolbar, Typography, Container, IconButton, CssBaseline } from '@mui/material'
import { useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import SendIcon from '@mui/icons-material/Send'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Support Agent at Skin Clinic Med Spa. How can I help you today?",
      avatar: '/images/avatar.png'
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '', avatar: '/images/avatar.png' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while(true){
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error(error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: 'An error occurred. Please try again later.', avatar: '/images/avatar.png' },
      ])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'white' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo Placeholder */}
            <Box component="img" src="/images/skin-clinic-medspa-logo.png" alt="Logo" sx={{ height: 40 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Roboto', color: 'grey.800' }}>
            </Typography>
          </Toolbar>
        </AppBar>

        <Container sx={{ flexGrow: 1, py: 3 }}>
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            sx={{
              bgcolor: 'grey.100',
              borderRadius: 2,
              boxShadow: 3,
              overflow: 'hidden',
              height: '100%',
              maxHeight: '100%',
            }}
          >
            <Box sx={{ overflowY: 'auto', px: 3, py: 2, flexGrow: 1 }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="flex-start"
                  justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }
                  sx={{
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  {message.role === 'assistant' && (
                    <Avatar
                      alt="Assistant"
                      src={message.avatar}
                      sx={{ marginRight: 2 }}
                    />
                  )}
                  <Box
                    bgcolor={
                      message.role === 'assistant'
                        ? 'grey.800'
                        : 'grey.500'
                    }
                    color="white"
                    borderRadius={16}
                    p={2}
                    maxWidth="75%"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked(message.content)),
                    }}
                  />
                </Box>
              ))}
            </Box>

            <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2, display: 'flex', alignItems: 'center', bgcolor: 'white' }}>
              <TextField
                label="Type your message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                sx={{
                  marginRight: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                }}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={isLoading}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  )
}
