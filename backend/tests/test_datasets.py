"""
Test Datasets listing and metadata validation.
"""

from app.api.routes.datasets import list_datasets


def test_list_datasets(db):
    resp = list_datasets(page=1, page_size=10, db=db)
    assert resp.success is True
    assert resp.data.total >= 1
    assert len(resp.data.items) >= 1
    first = resp.data.items[0]
    assert first.name == "Tamil Nadu Official Tourism Benchmark Dataset"
    assert first.status == "loaded"

