import matplotlib.pyplot as plt

a = [23, 43, 12, 55, 63, 18]
b = [44, 11, 21, 77, 44, 28]
c = [53, 42, 16, 46, 55, 10]
d = [11, 66, 23, 14, 88, 34]

fig, axs = plt.subplots(2, 2)

axs[0, 0].plot(a, color='blue')
axs[0, 1].plot(b, color='green')
axs[1, 0].plot(c, color='red')
axs[1, 1].plot(d, color='yellow')

axs[0, 0].set_title('Plot A')
axs[0, 1].set_title('Plot B')
axs[1, 0].set_title('Plot C')
axs[1, 1].set_title('Plot D')

plt.show()
