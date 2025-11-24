import { useState } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false)

  const handleNumberClick = (num: string) => {
    if (shouldResetDisplay) {
      setDisplay(num)
      setShouldResetDisplay(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const handleOperationClick = (op: string) => {
    const currentValue = parseFloat(display)
    
    if (previousValue === null) {
      setPreviousValue(currentValue)
    } else if (operation) {
      const result = calculateResult(previousValue, currentValue, operation)
      setDisplay(String(result))
      setPreviousValue(result)
    }
    
    setOperation(op)
    setShouldResetDisplay(true)
  }

  const calculateResult = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current
      case '-':
        return prev - current
      case '×':
        return prev * current
      case '÷':
        return prev / current
      default:
        return current
    }
  }

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display)
      const result = calculateResult(previousValue, currentValue, operation)
      setDisplay(String(result))
      setPreviousValue(null)
      setOperation(null)
      setShouldResetDisplay(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setShouldResetDisplay(false)
  }

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay('0.')
      setShouldResetDisplay(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">電卓</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900 text-white p-6 rounded-lg text-right">
            <div className="text-sm text-gray-400 h-6">
              {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
            </div>
            <div className="text-4xl font-bold truncate">{display}</div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="text-lg font-semibold bg-red-100 hover:bg-red-200"
              onClick={handleClear}
            >
              C
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={handleBackspace}
            >
              ⌫
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold col-span-2 bg-orange-100 hover:bg-orange-200"
              onClick={() => handleOperationClick('÷')}
            >
              ÷
            </Button>

            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('7')}
            >
              7
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('8')}
            >
              8
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('9')}
            >
              9
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold bg-orange-100 hover:bg-orange-200"
              onClick={() => handleOperationClick('×')}
            >
              ×
            </Button>

            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('4')}
            >
              4
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('5')}
            >
              5
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('6')}
            >
              6
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold bg-orange-100 hover:bg-orange-200"
              onClick={() => handleOperationClick('-')}
            >
              -
            </Button>

            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('1')}
            >
              1
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('2')}
            >
              2
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={() => handleNumberClick('3')}
            >
              3
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold bg-orange-100 hover:bg-orange-200"
              onClick={() => handleOperationClick('+')}
            >
              +
            </Button>

            <Button 
              variant="outline" 
              className="text-lg font-semibold col-span-2"
              onClick={() => handleNumberClick('0')}
            >
              0
            </Button>
            <Button 
              variant="outline" 
              className="text-lg font-semibold"
              onClick={handleDecimal}
            >
              .
            </Button>
            <Button 
              className="text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleEquals}
            >
              =
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
