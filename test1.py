data = [
    {
        'id': 1, 'text':'a'
    },{
        'id': 2, 'text':'b'
    },{
        'id': 3, 'text':'c'
    },{
        'id': 4, 'text':'d'
    },{
        'id': 5, 'text':'e'
    },{
        'id': 6, 'text':'f'
    },{
        'id': 7, 'text':'g'
    },{
        'id': 8, 'text':'h'
    },
]

a = [v for v in data if v['id'] == 2]
print(a)