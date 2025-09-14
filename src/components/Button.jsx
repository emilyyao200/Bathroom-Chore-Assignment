import { useState } from 'react'

function Button({children}) {
    const [count, setCount] = useState(0)

    return (
        <button onClick={() => setCount((count) => count + 1)}>
          {children} {count}
        </button>
    )
}

export default Button;