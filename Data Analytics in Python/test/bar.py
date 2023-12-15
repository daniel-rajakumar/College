import matplotlib.pyplot as plt

pets = ['Dog', 'Cat', 'Lizard', 'Hamster', 'Aardvark']
owners = [35, 27, 13, 8, 2]

plt.bar(pets, owners, color=['red', 'blue', 'green', 'orange', 'purple'])
# plt.bar(pets, owners, colors=['red', 'blue', 'green', 'orange', 'purple'])
plt.title('Number of Owners by Pet')
plt.xlabel('Pet')
plt.ylabel('Number of Owners')

plt.show()
