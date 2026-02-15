"""直接测试运行中服务器的 TreeGenerator 行为"""
import os, sys, traceback
sys.stdout.reconfigure(encoding='utf-8')
os.chdir('d:/MetaMode/backend')

import pathlib
from dotenv import load_dotenv
env_path = pathlib.Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

from app.ai_service import TreeGenerator

api_key = os.getenv('DEEPSEEK_API_KEY', '')
base_url = os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
print(f"API Key: {api_key[:15]}... (len={len(api_key)})")
print(f"Base URL: {base_url}")

gen = TreeGenerator(api_key=api_key, base_url=base_url)
print(f"is_mock: {gen.is_mock}")

# 调用 generate（不是 _call_api），模拟路由行为
print("\n--- Calling generate() ---")
try:
    result = gen.generate("学钢琴", "零基础3个月")
    print(f"Result: {len(result)} nodes")
    for n in result:
        print(f"  - {n.get('title', '?')}")
    
    # 检查是否是 Mock
    is_mock_data = any("作息储备" in n.get("title", "") for n in result)
    print(f"\nIs Mock data: {is_mock_data}")
except Exception as e:
    print(f"EXCEPTION: {e}")
    traceback.print_exc()

# 直接调用 _call_api 看异常
print("\n--- Calling _call_api() directly ---")
try:
    result2 = gen._call_api("学钢琴", "零基础3个月")
    print(f"Result: {len(result2)} nodes")
    for n in result2:
        print(f"  - {n.get('title', '?')}")
    is_mock_data2 = any("作息储备" in n.get("title", "") for n in result2)
    print(f"Is Mock data: {is_mock_data2}")
except Exception as e:
    print(f"EXCEPTION: {e}")
    traceback.print_exc()
