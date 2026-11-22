"""
NLP and Text Preprocessing utilities for Web Mining and Sentiment Analysis.
"""

import re
import string
from typing import List

# Standard English stop words
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on",
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves", "also", "one", "two", "place", "visit", "destination", "travel", "tamil", "nadu"
}


def clean_html(text: str) -> str:
    """Strip HTML markup from raw web/review text."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", text)
    return clean


def normalize_whitespace(text: str) -> str:
    """Collapse consecutive whitespace and line breaks."""
    return re.sub(r"\s+", " ", text).strip()


def remove_punctuation(text: str) -> str:
    """Strip punctuation characters."""
    return text.translate(str.maketrans("", "", string.punctuation))


def tokenize_words(text: str) -> List[str]:
    """Tokenize and filter stop words and numeric noise."""
    cleaned = clean_html(text).lower()
    cleaned = remove_punctuation(cleaned)
    tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 2]
    return [t for t in tokens if t not in STOPWORDS and not t.isnumeric()]


def preprocess_text(text: str) -> str:
    """Full preprocessing pipeline returning clean space-separated tokens."""
    tokens = tokenize_words(text)
    return " ".join(tokens)

