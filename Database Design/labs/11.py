from pymongo import MongoClient

# Connect to MongoDB server
client = MongoClient("mongodb://localhost:27017/")

# Create a new database and collection
myDb = client["bookstore"]
collection = myDb["books"]

# Dataset to be inserted
books = [
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Classic", "price": 10.99, "copiesSold": 1200, "publishedYear": 1925, "average_rating": 4.5},
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "genre": "Classic", "price": 7.99, "copiesSold": 1800, "publishedYear": 1960, "average_rating": 4.75},
    {"title": "1984", "author": "George Orwell", "genre": "Dystopian", "price": 8.99, "copiesSold": 2500, "publishedYear": 1949, "average_rating": 4.25},
    {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "genre": "Classic", "price": 6.99, "copiesSold": 1300, "publishedYear": 1951, "average_rating": 3.75},
    {"title": "The Road", "author": "Cormac McCarthy", "genre": "Post-Apocalyptic", "price": 12.99, "copiesSold": 900, "publishedYear": 2006, "average_rating": 4.25}
]

# 1. Write Python code to insert the provided dataset into the books collection in your MongoDB database.
collection.insert_many(books)

# 2. Find all books in the genre Classic.
classic_books = list(collection.find({"genre": "Classic"}))

# 3. Retrieve books published before 1950
books_before_1950 = list(collection.find({"publishedYear": {"$lt": 1950}}))

# 4. Find all books that are either in the genre Classic or Dystopian
classic_or_dystopian_books = list(collection.find({"genre": {"$in": ["Classic", "Dystopian"]}}))

# 4. Retrieve books with a price greater than $8.00 and published after 1950
expensive_books_after_1950 = list(collection.find({"price": {"$gt": 8.00}, "publishedYear": {"$gt": 1950}}))

results = {
    "Classic Books": classic_books,
    "Books Before 1950": books_before_1950,
    "Classic or Dystopian Books": classic_or_dystopian_books,
    "Expensive Books After 1950": expensive_books_after_1950
}

for key, value in results.items():
    print(f"{key}:")
    for book in value:
        print(book)
    print("\n")
