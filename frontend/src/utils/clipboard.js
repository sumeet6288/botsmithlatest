/**
 * Utility function to copy text to clipboard with fallback support
 * Tries modern Clipboard API first, falls back to execCommand for older browsers
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  try {
    // Try modern clipboard API first
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback to textarea method for older browsers or permission issues
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    try {
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (execErr) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};
