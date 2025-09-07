import { useState } from "react"

const Togglable = ({ children, buttonLabel }: { children: React.ReactNode, buttonLabel: string }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>{buttonLabel}</button>
      {isVisible && children}
    </div>
  )
}

export default Togglable
