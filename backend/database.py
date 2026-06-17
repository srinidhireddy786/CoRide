import asyncpg
from urllib.parse import urlparse, unquote
from config import DATABASE_URL

pool = None

async def init_db():
    global pool
    url = urlparse(DATABASE_URL)
    pool = await asyncpg.create_pool(
        host=url.hostname,
        port=url.port,
        user=unquote(url.username),
        password=unquote(url.password),
        database=url.path.lstrip("/"),
        min_size=2,
        max_size=10,
        ssl="require",
        statement_cache_size=0,
    )

async def close_db():
    if pool:
        await pool.close()

async def fetch(query, *args):
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def fetchrow(query, *args):
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def fetchval(query, *args):
    async with pool.acquire() as conn:
        return await conn.fetchval(query, *args)

async def execute(query, *args):
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)