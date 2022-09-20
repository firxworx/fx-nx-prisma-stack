import styles from './shared-react-forms.module.css'

/* eslint-disable-next-line */
export interface SharedReactFormsProps {}

export function SharedReactForms(props: SharedReactFormsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SharedReactForms!</h1>
    </div>
  )
}

export default SharedReactForms
