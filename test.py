def runn():
    cum_delays = [0, 100, 195, 285, 370, 450, 525, 595, 660, 720, 775, 825, 870, 910, 945, 975, 1000]
    new_cum = []
    dels = []
    newlim = 700
    r = newlim / cum_delays[-1]

    for i in range(16):
        new_cum.append(int(cum_delays[i]*r))
        if i>0:
            dels.append(new_cum[i] - new_cum[i-1])
    print(new_cum)
    print(dels)

runn()
