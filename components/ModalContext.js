import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import ModalContainer from "./ModalContainer";

const ModalContext = createContext(null);

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);
  // Use a ref to hold the resolve callbacks to avoid stale closures
  const resolveRef = useRef({});

  const showAlert = useCallback((message, title = "Notice") => {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random(); // unique id
      resolveRef.current[id] = resolve;
      setModals((prev) => [
        ...prev,
        { id, type: "alert", message, title },
      ]);
    });
  }, []);

  const showConfirm = useCallback((message, title = "Confirm") => {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random();
      resolveRef.current[id] = resolve;
      setModals((prev) => [
        ...prev,
        { id, type: "confirm", message, title },
      ]);
    });
  }, []);

  const closeModal = useCallback((id, result) => {
    // Call the resolve function from the ref
    if (resolveRef.current[id]) {
      resolveRef.current[id](result);
      delete resolveRef.current[id];
    }
    // Remove the modal
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modals.map((modal) => (
        <ModalContainer key={modal.id} modal={modal} close={closeModal} />
      ))}
    </ModalContext.Provider>
  );
}