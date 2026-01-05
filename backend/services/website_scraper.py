import requests
from bs4 import BeautifulSoup
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class WebsiteScraper:
    """Scrape and extract text content from websites"""
    
    @staticmethod
    def scrape_url(url: str, timeout: int = 30) -> str:
        """
        Scrape text content from a URL
        
        Args:
            url: The URL to scrape
            timeout: Request timeout in seconds
            
        Returns:
            Extracted text content
        """
        try:
            # Add headers to avoid being blocked
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer"]):
                script.decompose()
            
            # Get text
            text = soup.get_text(separator='\n', strip=True)
            
            # Clean up extra whitespace
            lines = [line.strip() for line in text.splitlines()]
            lines = [line for line in lines if line]
            text = '\n'.join(lines)
            
            if not text:
                raise Exception("No content extracted from URL")
            
            return text
            
        except requests.RequestException as e:
            logger.error(f"Error scraping URL {url}: {str(e)}")
            raise Exception(f"Failed to scrape website: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing website content: {str(e)}")
            raise Exception(f"Failed to process website content: {str(e)}")
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate if URL is accessible"""
        try:
            response = requests.head(url, timeout=5)
            return response.status_code < 400
        except:
            return False
