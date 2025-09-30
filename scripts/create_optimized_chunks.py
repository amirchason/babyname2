#!/usr/bin/env python3
"""
Create optimized chunked database from the 224k names
Strategy:
- Core: Top 1000 popular names (instant load)
- Chunk 1: Names 1001-50000 (50k names)
- Chunk 2: Names 50001-100000 (50k names)
- Chunk 3: Names 100001-150000 (50k names)
- Chunk 4: Names 150001-224058 (74k names)
"""

import json
import sys
import gzip
from pathlib import Path

# Paths
PROJ_ROOT = Path("/data/data/com.termux/files/home/proj/babyname2")
SOURCE_DB = PROJ_ROOT / "data" / "namesDatabase.json"
PUBLIC_DATA = PROJ_ROOT / "public" / "data"

def load_source_database():
    """Load the 224k names database"""
    print(f"📊 Loading source database from {SOURCE_DB}...")
    with open(SOURCE_DB, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Extract names array
    if isinstance(data, dict) and 'names' in data:
        names = data['names']
        metadata = data.get('metadata', {})
    elif isinstance(data, list):
        names = data
        metadata = {}
    else:
        raise ValueError("Unexpected database structure")

    print(f"✅ Loaded {len(names)} names")
    return names, metadata

def create_chunks(names):
    """Split names into optimized chunks"""
    chunks = {
        'core': names[:1000],           # Top 1000 for instant load
        'chunk1': names[1000:50000],    # Names 1001-50000
        'chunk2': names[50000:100000],  # Names 50001-100000
        'chunk3': names[100000:150000], # Names 100001-150000
        'chunk4': names[150000:],       # Names 150001+
    }

    print(f"\n📦 Chunk sizes:")
    for chunk_name, chunk_data in chunks.items():
        print(f"  {chunk_name}: {len(chunk_data):,} names")

    return chunks

def save_chunk(chunk_name, chunk_data, metadata):
    """Save chunk as JSON and gzipped JSON"""
    output_file = PUBLIC_DATA / f"names-{chunk_name}.json"
    output_file_gz = PUBLIC_DATA / f"names-{chunk_name}.json.gz"

    # Create output structure
    output = {
        "metadata": {
            **metadata,
            "chunk": chunk_name,
            "totalNames": len(chunk_data),
            "description": f"Name database chunk: {chunk_name}"
        },
        "names": chunk_data
    }

    # Save regular JSON
    print(f"💾 Saving {output_file.name}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

    # Save gzipped version
    print(f"💾 Saving {output_file_gz.name}...")
    with gzip.open(output_file_gz, 'wt', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, separators=(',', ':'))

    # Report sizes
    size_json = output_file.stat().st_size / 1024 / 1024
    size_gz = output_file_gz.stat().st_size / 1024 / 1024
    print(f"  ✅ {chunk_name}: {size_json:.2f}MB (JSON), {size_gz:.2f}MB (GZ)")

    return output_file, output_file_gz

def create_index(chunks):
    """Create an index file with chunk metadata"""
    index = {
        "version": "2.0.0",
        "totalNames": sum(len(chunk) for chunk in chunks.values()),
        "chunks": {}
    }

    offset = 0
    for chunk_name, chunk_data in chunks.items():
        index["chunks"][chunk_name] = {
            "file": f"names-{chunk_name}.json",
            "fileGz": f"names-{chunk_name}.json.gz",
            "count": len(chunk_data),
            "startIndex": offset,
            "endIndex": offset + len(chunk_data) - 1
        }
        offset += len(chunk_data)

    # Save index
    index_file = PUBLIC_DATA / "names-index.json"
    print(f"\n📇 Saving index to {index_file.name}...")
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)

    # Save gzipped index
    index_file_gz = PUBLIC_DATA / "names-index.json.gz"
    with gzip.open(index_file_gz, 'wt', encoding='utf-8') as f:
        json.dump(index, f)

    print(f"✅ Index created: {index['totalNames']:,} total names across {len(index['chunks'])} chunks")
    return index

def main():
    print("🚀 Creating optimized chunked database for 224k+ names\n")

    # Ensure output directory exists
    PUBLIC_DATA.mkdir(parents=True, exist_ok=True)

    # Load source database
    names, metadata = load_source_database()

    # Create chunks
    chunks = create_chunks(names)

    # Save each chunk
    print("\n💾 Saving chunks...")
    for chunk_name, chunk_data in chunks.items():
        save_chunk(chunk_name, chunk_data, metadata)

    # Create index
    index = create_index(chunks)

    print("\n" + "="*60)
    print("✅ SUCCESS! Optimized chunked database created")
    print("="*60)
    print(f"Total names: {index['totalNames']:,}")
    print(f"Total chunks: {len(index['chunks'])}")
    print(f"\nCore chunk (instant load): {len(chunks['core']):,} names")
    print(f"Progressive load chunks: {len(names) - len(chunks['core']):,} names")
    print("\n📂 Files saved to:", PUBLIC_DATA)

if __name__ == "__main__":
    main()