import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  maxHeight?: string; 
  style?: React.CSSProperties;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title, width, maxHeight = '80vh', style}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" style={style}>
      <div className="modal-content" style={{ width: width || '400px', maxHeight: maxHeight }}>
        <div className="modal-header border-b border-gray-200">
          {title && <h2 className='font-avenir font-extrabold text-[24px] leading-8 tracking-tightpx m-0'>{title}</h2>}
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px; /* Add some padding so modal doesn't touch screen edges */
        }
        .modal-content {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.12);
          padding: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          max-height: ${maxHeight}; /* Make modal scrollable */
          overflow: hidden; /* Hide overflow from the container itself */
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid #217346;
          padding-bottom: 16px;
          flex-shrink: 0; /* Prevent header from shrinking */
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .modal-body {
          min-width: 300px;
          overflow-y: auto; /* Make body content scrollable */
          flex: 1; /* Take remaining space */
          padding-right: 8px; /* Add some space for scrollbar */
        }
        
        /* Custom scrollbar styling (optional) */
        .modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Modal;