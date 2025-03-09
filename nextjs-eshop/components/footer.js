import Link from 'next/link';

export default function Footer(){

  return(
    <div>
      <div className="uk-grid-collapse uk-child-width-1-1 uk-child-width-1-3@m uk-margin-medium-top" uk-grid="true">

        <div>
          <div className="uk-card uk-card-body uk-padding-remove-left uk-padding-remove-right">
            <div className="uk-margin-medium-bottom">
              <Link href="/">
                <a className="uk-logo">
                    <img className="" src="/assets/img/logo.png" alt="" width="70px"/>
                </a>
              </Link>
            </div>
            <p className="uk-text-normal">
              Copyright 2019 © Lionel Ensfelder. Made with love by me.<br/>
              Address: 111 Commerce Avenue, 83000 Toulon.<br/>
              Phone: 06 52 41 10 00<br/>
              Mail: ensfelder.lionel@gmail.com<br/>
              Opening Hours: 09.00 - 20.00
            </p>
          </div>
        </div>

        <div>
          <div className="uk-card uk-card-body uk-text-left uk-padding-remove-left uk-padding-remove-right">

            <h4 className="uk-text-bold uk-margin-medium-bottom">About Us</h4>

            <ul className="uk-list uk-text-left">
              <Link href="#"><a><li className="footer-list-links uk-margin-small-bottom">Delivery</li></a></Link>
              <Link href="#"><a><li className="footer-list-links uk-margin-small-bottom">Legal Notice</li></a></Link>
              <Link href="#"><a><li className="footer-list-links uk-margin-small-bottom">Terms and Conditions of Sale</li></a></Link>
              <Link href="#"><a><li className="footer-list-links uk-margin-small-bottom">About Us</li></a></Link>
              <Link href="#"><a><li className="footer-list-links uk-margin-small-bottom">Contact</li></a></Link>
            </ul>

          </div>
        </div>

        <div>
          <div className="uk-card uk-card-body uk-text-left uk-padding-remove-left uk-padding-remove-right">

            <h4 className="uk-text-bold uk-margin-small-bottom">Subscribe to our newsletter!</h4>

            <form>
              <div className="uk-margin-remove-bottom uk-inline">
                <a className="uk-form-icon uk-form-icon-flip" href=""><i className="uk-text-lead las la-envelope"></i></a>
                <input type="email" className="uk-input uk-form-width-large uk-form-large" placeholder="Your email address" />
              </div>
              <p className="uk-text-light uk-text-small uk-text-muted uk-margin-small-top">
                You can unsubscribe at any time. Find all information on the legal information page.
              </p>
              <h5 className="uk-text-bold uk-margin-small-bottom">Follow us on social media</h5>
              <div className="uk-grid-small" uk-grid="true">
                <div>
                  <a><i className="footer-social-icons lab la-facebook-square"></i></a>
                </div>
                <div>
                  <a><i className="footer-social-icons lab la-instagram"></i></a>
                </div>
                <div>
                  <a><i className="footer-social-icons lab la-youtube"></i></a>
                </div>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  )

}