import * as React from 'react'
import { fireEvent } from '@testing-library/react'

import { renderWithContextProvider } from './test-utils/react-test-utils'
import { ModalVariant, useModalContext } from '..'

const TEST_MODAL_CONTENT = 'Test Content' as const
const HIDE_MODAL_CAPTION = 'Hide Modal' as const
const SHOW_MODAL_CAPTION = 'Show Modal' as const

describe('useModalContext basic usage', () => {
  const App: React.FC = () => {
    const [showModal, hideModal] = useModalContext({ title: 'Modal Title', variant: ModalVariant.DEFAULT }, () => (
      <div>
        <p>{TEST_MODAL_CONTENT}</p>
        <button onClick={hideModal}>{HIDE_MODAL_CAPTION}</button>
      </div>
    ))

    return <button onClick={showModal}>{SHOW_MODAL_CAPTION}</button>
  }

  it('does not render modal content if showModal is not called', () => {
    const { queryByText } = renderWithContextProvider(<App />)

    expect(queryByText(TEST_MODAL_CONTENT)).not.toBeTruthy()
  })

  it('renders the modal with content when showModal is called', () => {
    const { getByText, queryByText } = renderWithContextProvider(<App />)

    fireEvent.click(getByText(SHOW_MODAL_CAPTION))
    expect(queryByText(TEST_MODAL_CONTENT)).toBeTruthy()
  })

  it('shows and hides the modal', () => {
    const { getByText, queryByText } = renderWithContextProvider(<App />)

    fireEvent.click(getByText(SHOW_MODAL_CAPTION))
    fireEvent.click(getByText(HIDE_MODAL_CAPTION))

    expect(queryByText(TEST_MODAL_CONTENT)).not.toBeTruthy()
  })

  it('hides modal when parent context component unmounts', () => {
    const { getByText, queryByText, rerender } = renderWithContextProvider(
      <div>
        <App />
      </div>,
    )

    fireEvent.click(getByText(SHOW_MODAL_CAPTION))
    rerender(<div />)
    expect(queryByText(TEST_MODAL_CONTENT)).not.toBeTruthy()
  })
})
