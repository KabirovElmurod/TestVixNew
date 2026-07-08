from rapidfuzz import fuzz

data = [
    'fizika', '2sinf', 'nyuton', 'test', 'bilim', 'mashq', 'o‘quvchi', 'darslik', 'sinov', 'masala'
]



a = "2-sinf uchun fizika darsligi"
items = a.split()
for item in items:
    for b in data:
        print('a=' + item + ', b=' + b + ': ' + str(fuzz.ratio(item, b)))        # umumiy o‘xshashlik
        # print(fuzz.partial_ratio(a,b)) # qisman o‘xshashlik
# for b in data:
#     print(fuzz.ratio(a, b))        # umumiy o‘xshashlik
    # print(fuzz.partial_ratio(a,b)) # qisman o‘xshashlik

# print(fuzz.ratio(a, b))        # umumiy o‘xshashlik
# print(fuzz.partial_ratio(a,b)) # qisman o‘xshashlik