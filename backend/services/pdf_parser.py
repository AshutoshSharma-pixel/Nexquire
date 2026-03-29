import pdfplumber
import re
from datetime import datetime

def parse_cams_pdf(file_path: str) -> list:
    """Parse CAMS consolidated statement PDF"""
    holdings = []
    
    try:
        with pdfplumber.open(file_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += (page.extract_text() or "") + "\n"
        
        # Pattern matching for CAMS format
        # Fund name pattern
        fund_pattern = re.compile(
            r"([A-Za-z\s\-&]+(?:Fund|Scheme|Plan|ETF)[^\n]*)\n"
            r".*?Units?\s*:\s*([\d,\.]+)\n"
            r".*?NAV\s*:\s*Rs?\.\s*([\d,\.]+)\n"
            r".*?Value\s*:\s*Rs?\.\s*([\d,\.]+)",
            re.DOTALL | re.IGNORECASE
        )
        
        matches = fund_pattern.findall(full_text)
        
        for match in matches:
            fund_name = match[0].strip()
            units = float(match[1].replace(",", ""))
            nav = float(match[2].replace(",", ""))
            value = float(match[3].replace(",", ""))
            
            holdings.append({
                "fund_name": fund_name,
                "units": units,
                "nav_at_statement": nav,
                "value_at_statement": value,
                "source": "cams_pdf"
            })
        
        # If regex fails, try table extraction
        if not holdings:
            holdings = _parse_tables(pdfplumber.open(file_path))
    
    except Exception as e:
        print(f"PDF parse error: {e}")
    
    return holdings

def _parse_tables(pdf) -> list:
    """Fallback: extract from tables"""
    holdings = []
    try:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if row and len(row) >= 4:
                        try:
                            name = str(row[0]).strip()
                            if len(name) > 10 and any(
                                kw in name.lower() 
                                for kw in ["fund", "scheme", "etf"]
                            ):
                                holdings.append({
                                    "fund_name": name,
                                    "units": float(str(row[1]).replace(",","")),
                                    "nav_at_statement": float(str(row[2]).replace(",","")),
                                    "value_at_statement": float(str(row[3]).replace(",","")),
                                    "source": "table"
                                })
                        except:
                            continue
    except:
        pass
    finally:
        pdf.close()
    return holdings
