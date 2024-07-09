import React, { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import "./App.css";

const TELEGRAM_BOT_TOKEN = "7147250303:AAH8EfuA_-nrp_TEzo4UC8EL9zJSY7p-pcY";
const TELEGRAM_CHAT_ID = "-1002186202487";

function App() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    clientName: "",
    bookName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetch("/data/books.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setBooks(data.books))
      .catch((error) => console.error("Error fetching books:", error));
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const openModal = (bookName) => {
    setOrderDetails({ ...orderDetails, bookName });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderDetails({
      clientName: "",
      bookName: "",
      phoneNumber: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { clientName, bookName, phoneNumber } = orderDetails;
    const text = `Order Details:\n👤Client Name: ${clientName}\n📕Book Name: ${bookName}\n📱Phone Number: ${phoneNumber}`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Display success message with SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Order sent successfully",
        });
        closeModal();
      } else {
        // Display error message with SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: `Failed to send order: ${result.description}`,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      // Display error message with SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to send order",
      });
    }
  };

  // Define filteredBooks based on searchQuery
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.published_year.toString().includes(searchQuery)
  );

  return (
    <div className="App">
      <div className="container mt-5">
        <div className="search-bar mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, or year..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="row">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div className="col-md-4 mb-4" key={book.id}>
                <div className="card h-100">
                  <img
                    src={book.image_url}
                    className="card-img-top"
                    alt={book.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{book.title}</h5>
                    <h6 className="card-subtitle mb-2">{book.author}</h6>
                    <p className="card-text">{book.summary}</p>
                    <button
                      className="btn btn-warning w-100"
                      onClick={() => openModal(book.title)}
                    >
                      Order
                    </button>
                  </div>
                  <div className="card-footer">
                    <small className="text-muted">
                      Published: {book.published_year}
                    </small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-warning" role="alert">
                No books found
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Book</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="clientName" className="form-label">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="clientName"
                      placeholder="John Doe"
                      name="clientName"
                      value={orderDetails.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bookName" className="form-label">
                      Book Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="bookName"
                      name="bookName"
                      value={orderDetails.bookName}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="998 99 999 99 99"
                      value={orderDetails.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Submit Order
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
