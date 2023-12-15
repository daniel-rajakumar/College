import matplotlib.pyplot as plt

midterm = {
  "hours_studied": [ 5,  7,  8,  7,  2, 17,  2,  9,  4, 11, 12,  9],
  "grade":         [99, 86, 87, 88, 82, 86, 65, 87, 94, 78, 77, 85]
}

final = {
  "hours_studied": [  2,  2,  8,  1, 15,  8, 12,  9,  7,  3, 11,  4,  7, 14],
  "grade":         [100, 80, 84, 85, 90, 99, 90, 95, 94, 70, 79, 62, 91, 80]
}

plt.scatter(midterm['hours_studied'], midterm['grade'], color='red')
plt.scatter(final['hours_studied'], final['grade'], color='blue')

plt.xlabel('Hours Studied')
plt.ylabel('Grade')

plt.legend(['Midterm', 'Final'])

plt.show()


