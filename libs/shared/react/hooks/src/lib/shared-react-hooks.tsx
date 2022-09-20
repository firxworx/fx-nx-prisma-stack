import styles from './shared-react-hooks.module.css'

/* eslint-disable-next-line */
export interface SharedReactHooksProps {}

export function SharedReactHooks(props: SharedReactHooksProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SharedReactHooks!</h1>
    </div>
  )
}

export default SharedReactHooks
