#!/usr/bin/env python
"""Encrypt a file store."""

import argparse
import os

import pyAesCrypt

parser = argparse.ArgumentParser(prog="encode", description="Encrypt a data store.")
parser.add_argument(
    "--store",
    "-i",
    action="store",
    default="store.yml",
    dest="file_store",
    help="the file to encrypt including the path, if needed; " "default: 'store.yml'",
    type=str,
)
parser.add_argument(
    "--output",
    "-o",
    action="store",
    default=os.getenv("SECURE_STORE_FILENAME", "store.aes"),
    dest="encrypted_file",
    help="the output filename including the path, if needed; "
    "default: SECURE_STORE_FILENAME environment var or"
    "         'store.aes'",
    type=str,
)
parser.add_argument(
    "--password",
    "-p",
    action="store",
    default=os.getenv("SECURE_STORE_PASSWORD", None),
    dest="password",
    help="the encryption password",
    required=True,
    type=str,
)
parser.add_argument(
    "--buffer",
    "-b",
    action="store",
    default=64 * 1024,  # 64K
    dest="buffer",
    help="the encryption buffer size; " "default: 64K (65536)",
    type=int,
)
args = parser.parse_args()

buffer_size = args.buffer
input_file = args.file_store
output_file = args.encrypted_file
password = args.password

pyAesCrypt.encryptFile(input_file, output_file, password, buffer_size)
