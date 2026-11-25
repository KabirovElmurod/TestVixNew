# -*- coding: utf-8 -*-
"""Barcha pattern demolarini ishga tushiradi."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from . import singleton, factory, adapter, decorator, observer, strategy


def run_all():
    print("=" * 50)
    print("1. SINGLETON")
    singleton.demo()
    print("=" * 50)
    print("2. FACTORY METHOD")
    factory.demo()
    print("=" * 50)
    print("3. ADAPTER")
    adapter.demo()
    print("=" * 50)
    print("4. DECORATOR")
    decorator.demo()
    print("=" * 50)
    print("5. OBSERVER")
    observer.demo()
    print("=" * 50)
    print("6. STRATEGY")
    strategy.demo()


if __name__ == "__main__":
    run_all()
