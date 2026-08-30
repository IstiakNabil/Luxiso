import Container from "../Container";

import Newsletter from "./Newsletter";
import FooterLinks from "./FooterLinks";
import SocialLinks from "./SocialLinks";
import FooterBottom from "./FooterBottom";

function Footer() {
  return (
    <footer className="bg-[#0F141D] pt-12 pb-10">
      <Container>
        <div className="flex items-start justify-between">
          <div>
            <Newsletter />
            <SocialLinks />
          </div>

          <FooterLinks />
        </div>

        <FooterBottom />
      </Container>
    </footer>
  );
}

export default Footer;