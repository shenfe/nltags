# nltags

A service for labeling in POS and DP.

## Data Structure

### POS

Example:

```json
{
    "word": "奇",
    "records": [
        {
            "pronounce": "qi4",
            "type": "a", // 形容词
            "explain": "奇异；不同寻常。"
        },
        {
            "pronounce": "ji1",
            "records": [
                {
                    "type": "n", // 名词
                    "explain": "零数；零头。"
                },
                {
                    "type": "a",
                    "records": [
                        {
                            "explain": "单；单数的。"
                        },
                        {
                            "explain": "（运气、命运）不好；不顺。"
                        }
                    ]
                }
            ]
        }
    ]
}
```

### DP

Example:

```json
{
    "phrase": "我送她鲜花",
    "records": [
        {
            "relation": "SBV", // 主谓关系
            "this": "0-1", // <start_position>[-<word_length>]
            "that": "1"
        },
        {
            "relation": "VOB", // 动宾关系
            "this": "1",
            "that": "3-2"
        },
        {
            "relation": "IOB", // 间宾关系
            "this": "1",
            "that": "2"
        }
    ]
}
```

### SDP

Example:

```json
{
    "phrase": "我送她鲜花",
    "records": [
        {
            "relation": "Agt", // 施事关系
            "this": "0",
            "that": "1"
        },
        {
            "relation": "Pat", // 受事关系
            "this": "1",
            "that": "2"
        },
        {
            "relation": "Cont", // 客事关系
            "this": "1",
            "that": "3-2"
        }
    ]
}
```

## Storage

* CouchDB (Master)
* PouchDB

## License

MIT
