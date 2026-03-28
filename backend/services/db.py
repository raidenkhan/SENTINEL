from supabase import create_client, Client
from core.config import settings

def get_supabase_client() -> Client:
    """
    Initializes and returns the Supabase Python client.
    """
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    supabase: Client = create_client(url, key)
    return supabase

# Singleton instance to be imported
supabase_client = get_supabase_client()
